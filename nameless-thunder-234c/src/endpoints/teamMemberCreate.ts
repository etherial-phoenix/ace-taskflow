import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, TeamMember } from "../types";

export class TeamMemberCreate extends OpenAPIRoute {
    schema = {
        tags: ["Team Members"],
        summary: "Add a new member to a team",
        request: {
            params: z.object({
                teamId: z.string(),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            user_id: z.string(),
                            role: z.string(),
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Returns the created team member",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                            result: z.object({
                                teamMember: TeamMember,
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();
        const { teamId } = data.params;
        const { user_id, role } = data.body;

        // Implement your own object insertion here

        // return the new team member
        return {
            success: true,
            teamMember: {
                team_id: teamId,
                user_id,
                role,
            },
        };
    }
}
