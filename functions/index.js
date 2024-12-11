const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = require('./utils/logger.js');

admin.initializeApp();

// Get countries route
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

    // Shuffle the array to get a random set of countries
    const shuffledCountries = countries.sort(() => 0.5 - Math.random());

    // Select the specified number of countries
    const selectedCountries = shuffledCountries.slice(0, 10);

    // Get hints for the selected countries
    const countriesAndHints = {};
    for (const country of selectedCountries) {
      const docRef = doc(db, "countries", country);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hints) {
          countriesAndHints[country] = data.hints;
        } else {
          countriesAndHints[country] = ["No Hints Found"];
        }
      } else {
        logger.warn(`No document found for country: ${country}`);
      }
    }
    console.log("Retrieved countries:", countriesAndHints); // For debugging
    return res.json(countriesAndHints);
  } catch (error) {
    logger.error("Error querying the database:", error);
    return res.status(500).json({ error: error.message });
  }
});
