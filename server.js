const express = require('express');
const multer = require('multer');
const bitcore = require('bitcore-lib-cash');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Setup multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('photo'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: 'Please upload a file.' });
  }
  res.send({ url: `/uploads/${file.filename}` });
});

app.post('/sendBCH', async (req, res) => {
  const { privateKeyWIF, recipientAddress, amount } = req.body;
  
  try {
    const privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF);
    const address = privateKey.toAddress();
    
    // Fetch UTXOs
    const utxosResponse = await axios.get(`https://api.fullstack.cash/v5/electrumx/utxos/${address}`);
    const utxos = utxosResponse.data.utxos;

    // Create the transaction
    const transaction = new bitcore.Transaction()
      .from(utxos)
      .to(recipientAddress, amount * 1e8) // amount in satoshis
      .change(address)
      .sign(privateKey);

    // Broadcast the transaction
    const rawTx = transaction.serialize();
    const broadcastResponse = await axios.post('https://api.fullstack.cash/v5/electrumx/tx/broadcast', { rawTx });
    res.send({ txid: broadcastResponse.data.txid });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
