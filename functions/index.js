const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.SavePlayerRecords7 = functions.https.onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const uid = authHeader?.split("Bearer ")[1];
    if (!uid || !req.body.data)
      return res.status(400).json({ error: "Missing token or data" });

    const parsed = JSON.parse(req.body.data);
    await admin.firestore().collection("players").doc(uid).set(parsed);
    return res.status(200).json({ result: "0" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

exports.GetPlayerRecords2 = functions.https.onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const uid = authHeader?.split("Bearer ")[1];
    if (!uid)
      return res.status(400).json({ error: "Missing token" });

    const doc = await admin.firestore().collection("players").doc(uid).get();
    if (!doc.exists)
      return res.status(200).json({ result: "{}" });

    return res.status(200).json({ result: JSON.stringify(doc.data()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
