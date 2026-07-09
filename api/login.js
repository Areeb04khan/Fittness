const { makeSessionCookie } = require("./_auth");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    res.status(500).json({ error: "Server is not configured (SITE_PASSWORD missing)." });
    return;
  }

  const { password } = req.body || {};
  if (typeof password !== "string" || password !== sitePassword) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  res.setHeader("Set-Cookie", makeSessionCookie());
  res.status(200).json({ ok: true });
};
