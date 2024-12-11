const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getCountries = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const db = admin.firestore();
    const snapshot = await db.collection("countries").get();
    const countries = [];

    snapshot.forEach((doc) => {
      // doc.id will give us "america", "china", etc.
      countries.push(doc.id.toUpperCase());
    });

    console.log("Retrieved countries:", countries); // For debugging
    return res.json(countries);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});
