import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  board_id: z.string().uuid('Invalid board ID format').optional(),
  assignee: z.string().uuid('Invalid assignee ID format').optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
