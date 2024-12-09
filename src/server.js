const express = require('express');
const countriesRouter = require('../routes/ran_count'); // Adjust the path as necessary
const app = express();

// Middleware
app.use(express.json()); // For parsing JSON

// Routes
app.use('/api', countriesRouter); // Mount the router at the '/api' base path

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});