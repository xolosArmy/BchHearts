const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const bitcoincash = require('bitcoincashjs-lib');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Body parser for JSON
app.use(express.json());

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

// Platform's BCH wallet address
const PLATFORM_WALLET_ADDRESS = 'bitcoincash:qq9lyu2yphzqhen6khrs43la9e429hkhcykl0enpn0';
const NETWORK = bitcoincash.networks.testnet; // Use testnet for development, switch to mainnet for production

// Endpoint to create a new BCH wallet
app.post('/create-wallet', (req, res) => {
    const keyPair = bitcoincash.ECPair.makeRandom({ network: NETWORK });
    const { address } = bitcoincash.payments.p2pkh({ pubkey: keyPair.publicKey, network: NETWORK });
    const privateKey = keyPair.toWIF();
    res.json({ address, privateKey });
});

// Endpoint to handle BCH transactions
app.post('/send-bch', async (req, res) => {
    const { recipientAddress, amountBCH, feeSatoshis } = req.body;

    try {
        // Create and sign transaction logic here
        // For example, using a simple transaction placeholder
        const tx = new bitcoincash.TransactionBuilder(NETWORK);
        tx.addInput(/* Input details here */);
        tx.addOutput(recipientAddress, amountBCH * 1e8 - feeSatoshis); // Convert BCH to satoshis
        tx.addOutput(PLATFORM_WALLET_ADDRESS, feeSatoshis); // Fee output
        tx.sign(/* Signing logic here */);

        const txHex = tx.build().toHex();

        // Example using Memo API
        await axios.post('https://memocash.github.io/#api/send', { tx: txHex });
        res.json({ status: 'Transaction Successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing transaction' });
    }
});

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
