const { isAuthed } = require("./_auth");
const { MEDICATIONS, SUPPLEMENTS } = require("./_privateData");

module.exports = (req, res) => {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Not logged in." });
    return;
  }
  res.status(200).json({ medications: MEDICATIONS, supplements: SUPPLEMENTS });
};
