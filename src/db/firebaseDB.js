const { getFirestore, doc, getDoc, query, where, getDocs, collection } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
require('dotenv').config();

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

class DB {
/**
 * METHODS -
 *  getCountry(countryName: str)
 *      returns country document from db
 *
 *  getCountryWithCharNumber(charNumber: number)
 *      returns a list of contries with matching number of chars
 */
    constructor() {
        this.db = getFirestore(app);
    }

    async getCountries(numberOfCountries) {
        // Returns a random list of country name
        // Call with the amount of countries you want ex: getCountries(10)
        if (typeof numberOfCountries !== "number" || numberOfCountries <= 0) {
            throw new Error("Argument must be a positive integer");
        }
        try {
            const q = query(collection(this.db, "countries"));
            const querySnapshot = await getDocs(q);
            const allCountries = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().name) {
                    allCountries.push(doc.data().name);
                }
            });

            // Shuffle the array to get a random set of countries
            const shuffledCountries = allCountries.sort(() => 0.5 - Math.random());

            // Select the specified number of countries
            const selectedCountries = shuffledCountries.slice(0, numberOfCountries);

            return selectedCountries;
        } catch (error) {
            console.error("Error querying the database:", error);
            throw error;
        }
    }

    async getHints(listCountries) {
        // Takes a list of countries (strings) and gives all hints
        // Return format { "spain": ["Hint", "hint"], "russia": ["hint"] }

        if (listCountries && listCountries.length > 0) {
            const hints = {};

            for (const country of listCountries) {
                const docRef = doc(this.db, "countries", country);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {

                    const data = docSnap.data();
                    if (data.hints) {
                        hints[country] = data.hints;
                    } else {
                        hints[country] = "No Hints Found"
                    }
                } else {
                    console.log(`No document found for country: ${country}`);
                }
            }

            return hints;
        } else {
            console.log('No countries provided');
            return {};
        }
    }
}
module.exports = DB;


// // Just gives me the ability to test my functions
// // command to run - node src/db/firebaseDB.js
// const dbInstance = new DB();
// const testQuery = async () => {
//     try {
//         const documents = await dbInstance.getHints(['america', 'spain']);
//         // const documents = await dbInstance.getCountries(10);
//         if (documents.length > 0 || Object.keys(documents).length > 0) {
//             console.log(documents)
//         } else {
//             console.log("No documents found.");
//         }
//     } catch (error) {
//         console.error("Error querying the database:", error);
//     }
// };
// testQuery().then(() => {
//     process.exit();
// });

