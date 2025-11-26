import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class TeamMemberDelete extends OpenAPIRoute {
    schema = {
        tags: ["Team Members"],
        summary: "Remove a member from a team",
        request: {
            params: z.object({
                teamId: z.string(),
                memberId: z.string(),
            }),
        },
        responses: {
            "200": {
                description: "Returns a success message",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: z.boolean(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();
        const { teamId, memberId } = data.params;

        // Implement your own object deletion here

        return {
            success: true,
        };
    }
}
