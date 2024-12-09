const express = require('express');
const countryRouter = require('../routes/ran_count');
const app = express();

// Mount the router
app.use('/', countryRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});