
import { z } from "zod";

const JOB_TYPES = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "REMOTE",
] as const;

export const profileSchema = z
    .object({
        phone: z.string().trim().max(20, "Phone number is too long"),
        headline: z.string().trim().max(120, "Headline cannot exceed 120 characters"),
        summary: z.string().trim().max(2000, "Summary cannot exceed 2000 characters"),
        location: z.string().trim().max(100, "Location cannot exceed 100 characters"),
        preferredRoles: z.string(),
        preferredLocations: z.string(),
        preferredJobTypes: z.string(),
        expectedSalaryMin: z.string(),
        expectedSalaryMax: z.string(),
        noticePeriod: z.string().trim().max(50, "Notice period is too long"),
    })
    .superRefine((data, ctx) => {
        const min = data.expectedSalaryMin.trim();
        const max = data.expectedSalaryMax.trim();

        if (min && (!Number.isFinite(Number(min)) || Number(min) < 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["expectedSalaryMin"],
                message: "Enter a valid non-negative minimum salary",
            });
        }

        if (max && (!Number.isFinite(Number(max)) || Number(max) < 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["expectedSalaryMax"],
                message: "Enter a valid non-negative maximum salary",
            });
        }

        if (min && max && Number(min) > Number(max)) {
            ctx.addIssue({
                code: "custom",
                path: ["expectedSalaryMax"],
                message: "Maximum salary must be greater than or equal to minimum salary",
            });
        }

        const selectedTypes = data.preferredJobTypes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        const invalidTypes = selectedTypes.filter(
            (type) => !JOB_TYPES.includes(type as (typeof JOB_TYPES)[number])
        );

        if (invalidTypes.length > 0) {
            ctx.addIssue({
                code: "custom",
                path: ["preferredJobTypes"],
                message: `Invalid job types: ${invalidTypes.join(", ")}`,
            });
        }
    });

export type ProfileFormValues = z.infer<typeof profileSchema>;
