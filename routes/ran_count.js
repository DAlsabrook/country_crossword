const express = require('express');
const router = express.Router();

// List of countries
const countries = [
    "GERMANY", "RUSSIA", "EGYPT", "CHINA",
  "UNITEDKINGDOM", "AMERICA", "BRAZIL", "JAPAN",
  "AUSTRALIA", "INDIA", "NEWZEALAND", "SWEDEN", "GREENLAND", "ICELAND"
];

// List of countries with hints
const countryHints = {
    GERMANY: "Capital city is Berlin, home to the Brandenburg Gate.",
    RUSSIA: "Largest country in the world, spanning Europe and Asia.",
    EGYPT: "Land of the Pharaohs and the Great Pyramids of Giza.",
    CHINA: "Famous for the Greate Wall and the Forbidden CIty.",
    UNITEDKINGDOM: "Known for tea culture and the London Eye.",
    AMERICA: "Its national bird is the bald eagle.",
    BRAZIL: "Home to the Amazon Rainforest and Christ the Redeemer statue.",
    JAPAN: "Know for Mt. Fuji, cherry blossoms, and high-tech cities.",
    AUSTRALIA: "Known for the Sydney Opera House and kangaroos.",
    INDIA: "Known for its spices, yoga, colorful festivals, and Bollywood movies",
    NEWZEALAND: "Known for its breathtaking landscapes",
    SWEDEN: "placeholder",
    GREENLAND: "placeholder",
    ICELAND: "placeholder"
}

router.get('/countries', (req, res) => {
    if (countries.length === 0) {
        return res.status(404).json({ error: 'No countries found' });
    }

    // Ensure we don't try to get more countries than exist
    const numCountries = Math.min(10, countries.length);
    
    // Create a copy of the array to avoid modifying the original
    let availableCountries = [...countries];
    let randomCountries = [];
    
    // Select random countries
    for (let i = 0; i < numCountries; i++) {
        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        randomCountries.push(availableCountries[randomIndex]);
        // Remove the selected country to avoid duplicates
        availableCountries.splice(randomIndex, 1);
    }
    
    res.json({ countries: randomCountries });
});

module.exports = router;