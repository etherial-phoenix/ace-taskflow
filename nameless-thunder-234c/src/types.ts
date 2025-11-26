import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	title: z.string(),
	slug: z.string().optional(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	due_date: z.string().optional(),
	user_id: z.string().optional(),
	priority: z.string().optional(),
	project_id: z.string().optional(),
});

export const TeamMember = z.object({
	id: z.string().optional(),
	team_id: z.string().optional(),
	user_id: z.string().optional(),
	role: z.string().optional(),
});
