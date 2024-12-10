const express = require('express');
const router = express.Router();
const DB = require('../src/db/firebaseDB.js');
const logger = require('../src/utils/logger'); 

router.get('/countries', async (req, res) => {
    const db = new DB();
    try {
        const countries = await db.getCountries(10);
        res.json(countries);
    } catch (error) {
        logger.error("Error fetching countries:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
