import { z } from "zod";

export const gitlabConfigSchema = z.object({
  endpoint: z.string().min(1, "Endpoint is required").url("Must be a valid URL"),
  projectId: z.string().min(1, "Project ID is required"),
  arbFilepaths: z.string().min(1, "At least one filepath is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

export type GitlabConfig = z.infer<typeof gitlabConfigSchema>;
