const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Login User - onCall
 * data = { email, password }
 */
exports.loginUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email dan password diperlukan."
    );
  }

  try {
    // Gunakan Firebase Auth REST API untuk login
    const fetch = (await import("node-fetch")).default;
    const FIREBASE_API_KEY = "MASUKKAN_FIREBASE_API_KEY_MU"; // ganti sesuai project

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const result = await res.json();

    if (result.error) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        result.error.message
      );
    }

    // Pastikan ada dokumen player
    const playerRef = db.collection("players").doc(result.localId);
    const playerDoc = await playerRef.get();
    if (!playerDoc.exists) {
      await playerRef.set({
        Name: email.split("@")[0],
        Coin: 0,
        Money: 5000,
        Level: 1,
        Rank: "BEGINNER",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      localId: result.localId,
      email: result.email,
    };
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message);
  }
});
