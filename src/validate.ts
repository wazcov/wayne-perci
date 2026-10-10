import { z } from "zod";

const required = z.string("is required").min(1, "is required");
const isoDate = z.iso.date("must be a valid date in YYYY-MM-DD format");
const isValidDate = (value: string): boolean => isoDate.safeParse(value).success;

function memberSchema(today: string) {
  return z
    .object({
      partner_member_id: z.guid("must be a GUID"),
      first_name: required,
      last_name: required,
      date_of_birth: isoDate,
      email: z.email("must be a valid email address"),
      policy_start: isoDate,
      policy_end: z.string("is required").refine((v) => v === "" || isValidDate(v), "must be blank or a valid date in YYYY-MM-DD format"),
    })
    .superRefine((member, ctx) => {
      if (isValidDate(member.date_of_birth) && member.date_of_birth > today) {
        ctx.addIssue({ code: "custom", path: ["date_of_birth"], message: "must not be in the future" });
      }
      if (isValidDate(member.policy_start) && isValidDate(member.policy_end) && member.policy_end < member.policy_start) {
        ctx.addIssue({ code: "custom", path: ["policy_end"], message: "must not be before policy_start" });
      }
    });
}

type Member = z.infer<ReturnType<typeof memberSchema>>;

export function validateMembers(rows: Record<string, string>[], today = new Date().toISOString().slice(0, 10)) {
  const schema = memberSchema(today);
  const members: Member[] = [];
  const rejected: { line: number; row: Record<string, string>; reasons: string[] }[] = [];
  const seenIds = new Set<string>();

  rows.forEach((row, i) => {
    const line = i + 2;
    const result = schema.safeParse(row);

    if (!result.success) {
      rejected.push({ line, row, reasons: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) });
    } else if (seenIds.has(result.data.partner_member_id)) {
      rejected.push({ line, row, reasons: ["partner_member_id: duplicate"] });
    } else {
      seenIds.add(result.data.partner_member_id);
      members.push(result.data);
    }
  });

  return { members, rejected };
}
