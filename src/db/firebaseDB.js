const { getFirestore, doc, getDoc } = require('firebase/firestore');
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
const db = getFirestore(app);

const getCountryOBJ = async (countryName) => {
    try {
        const docRef = doc(db, "countries", countryName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
}



// Function to test if the database is connected
const testDbConnection = async () => {
    try {
        const countryData = await getCountryOBJ("united states");
        if (countryData) {
            console.log("Database connected successfully and document retrieved.");
        } else {
            console.log("Document not found. Database connection might be successful.");
        }
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
};

// Call the function to test the connection
// testDbConnection();
