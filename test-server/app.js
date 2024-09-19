const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { AzureOpenAI } = require("openai");

require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors()); 

// You will need to set these environment variables or edit the following values
const endpoint = process.env.ENDPOINT;
const apiKey = process.env.API_KEY;
const apiVersion = "2024-05-13";
const deployment = "4otest"; //This must match your deployment name.
// const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

app.post('/api/message', async (req, res) => {
    const userMessage = req.body.message;
    // console.log(userMessage);
    try {
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
          };
      
          // Request payload
          const payload = {
            "messages": [
              {
                "role": "system",
                "content": [
                  {
                    "type": "text",
                    "text": userMessage
                  }
                ]
              }
            ],
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 200
          };
      
          // Make the HTTP request
          const response = await axios.post(endpoint, payload, { headers });
      
          // Send response back to client
          res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error with OpenAI API' });
    }
});


app.listen(3000, () => console.log('Server is running on port 3000'));