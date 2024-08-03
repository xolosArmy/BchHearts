const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Endpoint to handle photo uploads
app.post('/upload', upload.single('photo'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Serve the uploads directory
app.use('/uploads', express.static('uploads'));

// Endpoint to handle BCH transactions using Memo API
app.post('/sendBCH', (req, res) => {
    const { address, amount } = req.body;
    // Example: Sending BCH using Memo API
    axios.post('https://memocash.github.io/#api/send', { address, amount })
        .then(response => {
            res.json({ txid: response.data.txid });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error sending BCH' });
        });
});

// Example GraphQL query using Memo Index
app.get('/transactions', (req, res) => {
    const query = `
    {
        transactions {
            txid
            value
            timestamp
        }
    }`;

    axios.post('https://memo-api.memocash.com/graphql', { query })
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching transactions' });
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
