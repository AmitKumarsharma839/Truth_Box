
const express = require("express");
const next = require("next");
const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get("/api/express/health", (_req, res) => {
    res.json({ ok: true, runtime: "express", next: "14" });
  });

  server.all("*", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`TruthBox running on http://localhost:${port}`);
  });
});
