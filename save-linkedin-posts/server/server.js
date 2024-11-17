// server.js (Node.js/Express backend)
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Increase payload size limit
// app.use(express.json({limit: '10mb'}));
// app.use(express.urlencoded({limit: '10mb', extended: true}));

// app.use(cors());
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Add a test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Route to get posts
app.get('/api/posts', async (req, res) => {
  console.log('GET /api/posts request received'); // Debug log
  try {
      await client.connect();
      console.log('Connected to MongoDB');
      
      const collection = client.db("linkedin_posts").collection("posts");
      const posts = await collection.find({}).toArray();
      
      console.log('Posts found:', posts);
      res.json(posts);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }  // Added missing closing bracket here
});

// Route to save posts
app.post('/api/posts', async (req, res) => {
  console.log('POST /api/posts request received:', req.body); // Debug log
  console.log('Request body type:', typeof req.body);
  console.log('Request body:', req.body);
  try {
    await client.connect();
    const collection = client.db("linkedin_posts").collection("posts");
    const result = await collection.insertOne(req.body);
    console.log('Post saved:', result);
    console.log('Saved post data:', JSON.stringify(req.body, null, 2));
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }  // Added missing closing bracket here
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});