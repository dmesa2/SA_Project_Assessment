const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const podRoutes = require('./routes/podRoutes');

const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Define the root route to serve the index.ejs file
app.get('/', (req, res) => {
    res.render('index');  // Render the 'index.ejs' file
});

// Routes for pod creation
app.use('/', podRoutes);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
