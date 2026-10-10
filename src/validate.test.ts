import { describe, expect, it } from "vitest";
import { validateMembers } from "./validate";

const TODAY = "2026-10-10";

const validMember = {
  partner_member_id: "9277d5d0-d876-47db-b271-8bc4cc897e8f",
  first_name: "Alice",
  last_name: "Nguyen",
  date_of_birth: "1985-03-14",
  email: "alice@example.com",
  policy_start: "2026-01-01",
  policy_end: "2026-12-31",
};

describe("validateMembers", () => {
  it("accepts a valid row", () => {
    const { members, rejected } = validateMembers([validMember], TODAY);
    expect(rejected).toEqual([]);
    expect(members).toEqual([validMember]);
  });

  it("accepts a blank policy_end as an open-ended policy", () => {
    const { members } = validateMembers([{ ...validMember, policy_end: "" }], TODAY);
    expect(members[0].policy_end).toBe("");
  });

  it.each([
    ["partner_member_id", "", "partner_member_id: must be a GUID"],
    ["partner_member_id", "PM-10001", "partner_member_id: must be a GUID"],
    ["first_name", "", "first_name: is required"],
    ["last_name", "", "last_name: is required"],
    ["date_of_birth", "1990-02-30", "date_of_birth: must be a valid date in YYYY-MM-DD format"],
    ["date_of_birth", "14/03/1991", "date_of_birth: must be a valid date in YYYY-MM-DD format"],
    ["date_of_birth", "2030-06-15", "date_of_birth: must not be in the future"],
    ["email", "hiro.tanaka@example", "email: must be a valid email address"],
    ["policy_start", "", "policy_start: must be a valid date in YYYY-MM-DD format"],
    ["policy_end", "soon", "policy_end: must be blank or a valid date in YYYY-MM-DD format"],
    ["policy_end", "2025-12-31", "policy_end: must not be before policy_start"],
  ])("rejects %s = %j", (field, value, reason) => {
    const row = { ...validMember, [field]: value };
    const { members, rejected } = validateMembers([row], TODAY);
    expect(members).toEqual([]);
    expect(rejected).toEqual([{ line: 2, row, reasons: [reason] }]);
  });

  it("accepts a date of birth of today", () => {
    const { rejected } = validateMembers([{ ...validMember, date_of_birth: TODAY }], TODAY);
    expect(rejected).toEqual([]);
  });

  it("reports every problem with a row", () => {
    const row = { ...validMember, partner_member_id: "", last_name: "", date_of_birth: "nope" };
    const { rejected } = validateMembers([row], TODAY);
    expect(rejected[0].reasons).toEqual([
      "partner_member_id: must be a GUID",
      "last_name: is required",
      "date_of_birth: must be a valid date in YYYY-MM-DD format",
    ]);
  });

  it("rejects rows with missing columns", () => {
    const { policy_end, ...rowWithoutPolicyEnd } = validMember;
    const { rejected } = validateMembers([rowWithoutPolicyEnd], TODAY);
    expect(rejected[0].reasons).toEqual(["policy_end: is required"]);
  });

  it("rejects later rows that reuse an accepted partner_member_id", () => {
    const { members, rejected } = validateMembers([validMember, { ...validMember, first_name: "Jack" }], TODAY);
    expect(members.map((member) => member.first_name)).toEqual(["Alice"]);
    expect(rejected[0].reasons).toEqual(["partner_member_id: duplicate"]);
  });

  it("does not count an invalid row's ID as taken", () => {
    const { members } = validateMembers([{ ...validMember, email: "bad" }, validMember], TODAY);
    expect(members).toHaveLength(1);
  });
});
