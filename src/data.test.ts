import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadData, writeData, type MemberRow } from "./data";

const HEADER = "partner_member_id,first_name,last_name,date_of_birth,email,policy_start,policy_end";

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "members-"));
}

describe("loadData", () => {
  it("reads each CSV row into an object keyed by the header", async () => {
    const path = join(await tempDir(), "members.csv");
    await writeFile(path, `${HEADER}\nabc,Alice,Nguyen,1985-03-14,alice@example.com,2026-01-01,2026-12-31\n`);

    expect(await loadData(path)).toEqual([
      {
        partner_member_id: "abc",
        first_name: "Alice",
        last_name: "Nguyen",
        date_of_birth: "1985-03-14",
        email: "alice@example.com",
        policy_start: "2026-01-01",
        policy_end: "2026-12-31",
      },
    ]);
  });

  it("handles quoted fields, blank lines and short rows", async () => {
    const path = join(await tempDir(), "members.csv");
    await writeFile(path, `${HEADER}\n\nabc,"Dmitri ""Dima""","Smith, Jr",2001-01-30,d@example.com,2026-03-15\n`);

    const [row] = await loadData(path);
    expect(row.first_name).toBe('Dmitri "Dima"');
    expect(row.last_name).toBe("Smith, Jr");
    expect("policy_end" in row).toBe(false);
  });

  it("rejects when the file doesn't exist", async () => {
    await expect(loadData(join(await tempDir(), "missing.csv"))).rejects.toThrow("ENOENT");
  });
});

describe("writeData", () => {
  it("writes the rows as JSON", async () => {
    const path = join(await tempDir(), "members.json");
    const rows: MemberRow[] = [
      {
        partner_member_id: "abc",
        first_name: "Alice",
        last_name: "Nguyen",
        date_of_birth: "1985-03-14",
        email: "alice@example.com",
        policy_start: "2026-01-01",
        policy_end: "",
      },
    ];

    await writeData(path, rows);

    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(rows);
  });
});
