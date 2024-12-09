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
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    res.json({ country : randomCountry });
});

module.exports = router;