import express from "express";
import type { Server } from "node:http";

export function startServer(members: { partner_member_id: string }[], port = 3000): Server {
  const app = express();

  app.get("/members/:id", (req, res) => {
    const id = req.params.id.toLowerCase();
    const member = members.find((member) => member.partner_member_id.toLowerCase() === id);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    res.json(member);
  });

  return app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
}
