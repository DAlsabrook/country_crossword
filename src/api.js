// Express
const express = require('express');
const app = express();
const port = 3000;
const 

// Define simple route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Post endpoint
app.post('/users', (req, res) => {

});

app.listen(port, () => {
    console.log(`Server Start ${port}`);
});