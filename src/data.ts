import { readFile, writeFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

export type MemberRow = {
  partner_member_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  policy_start: string;
  policy_end: string;
};

// async function loadData(path: string): Promise<void> {
//   const text = await readFile(path, "utf8");
//   for (const line of text.trim().split("\n")) {
//     console.log(line);
//   }
// }
//      Switched away from the inital idea of manually splitting as lib can handle quotes and other difficult chars

export async function loadData(path: string): Promise<MemberRow[]> {
  const text = await readFile(path, "utf8");
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
}

export async function writeData(outputPath: string, rows: MemberRow[]): Promise<void> {
  await writeFile(outputPath, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} rows to ${outputPath}`);
}
