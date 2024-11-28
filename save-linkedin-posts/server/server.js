// server.js (Node.js/Express backend)
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const axios = require("axios");
const app = express();
const { OpenAIEmbeddings } = require('@langchain/openai');

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
      
      const collection = client.db("linkedin_posts").collection("posts");
      const posts = await collection.find({}).toArray();
      
      res.json(posts);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }  // Added missing closing bracket here
});

// Route to save posts
app.post('/api/posts', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("linkedin_posts").collection("posts");
    const result = await collection.insertOne(req.body);

    // Forward request to Python backend
    const pythonResponse = await axios.post('http://localhost:8000/save_post', {
      content: req.body.content,  // Post content for embeddings
      metadata: {
        id: result.insertedId.toString(),
        ...req.body
      }
    });
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }  // Added missing closing bracket here
});

app.post('/api/search', async (req, res) => {
  try {
      const { query } = req.body;
      if (!query) {
          throw new Error('No search query provided');
      }

      // Call the Python API
      const response = await axios.post('http://localhost:8000/search', {
          query_text: query,
          n_results: 2, // Top 5 results
          filters: {} // Optional metadata filters
      });

      res.json(response.data);
  } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});