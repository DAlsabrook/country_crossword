const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logger = require('./utils/logger.js');

admin.initializeApp();

const app = express();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Country Crossword API",
      version: "1.0.0",
      description: "API documentation for Country Crossword",
    },
    servers: [
      {
        url: "https://us-central1-country-crossword.cloudfunctions.net/api",
      },
    ],
  },
  apis: ["./index.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Get countries route
/**
 * @swagger
 * /getCountries:
 *   get:
 *     summary: Get a list of countries with hints
 *     responses:
 *       200:
 *         description: A list of countries with hints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: string
 */
app.get("/getCountries", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const db = admin.firestore();
    const snapshot = await db.collection("countries").get();
    const countries = [];

    snapshot.forEach((doc) => {
      countries.push(doc.id);
    });

    const shuffledCountries = countries.sort(() => 0.5 - Math.random());
    const selectedCountries = shuffledCountries.slice(0, 10);

    const countriesAndHints = {};
    for (const country of selectedCountries) {
      const docRef = db.collection("countries").doc(country);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        countriesAndHints[country] = data.hints || ["No Hints Found"];
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

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
