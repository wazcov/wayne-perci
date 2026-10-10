import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startServer } from "./server";

const alice = { partner_member_id: "9277d5d0-d876-47db-b271-8bc4cc897e8f", first_name: "Alice" };

describe("GET /members/:id", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Port 0 lets the OS pick a free port, so tests don't clash with a running dev server
    server = startServer([alice], 0);
    await once(server, "listening");
    baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
  });

  it("returns the member", async () => {
    const res = await fetch(`${baseUrl}/members/${alice.partner_member_id}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(alice);
  });

  it("matches IDs case-insensitively", async () => {
    const res = await fetch(`${baseUrl}/members/${alice.partner_member_id.toUpperCase()}`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for an unknown member", async () => {
    const res = await fetch(`${baseUrl}/members/unknown`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Member not found" });
  });
});
