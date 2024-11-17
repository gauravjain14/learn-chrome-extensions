const express = require('express');
const cors = require('cors');
const app = express();

// Enable middleware
app.use(cors());
app.use(express.json());

// Test route at root
app.get('/', (req, res) => {
    res.json({ message: 'Hello, server is working!' });
});

// Test route for posts
app.get('/api/posts', (req, res) => {
    res.json({ message: 'Posts endpoint working!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});