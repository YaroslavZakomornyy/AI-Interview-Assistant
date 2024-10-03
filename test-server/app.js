const express = require('express');
const axios = require('axios');
const cors = require('cors');
// const { AzureOpenAI } = require("openai");

require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors()); 

//The user's chat history
//Currently only supports one concurrent user. 
//In the future will be changed to some db (MongoDB - good for Read/Write. Reddis - fast and free if self-hosted)
const context = [];

// You will need to set these environment variables or edit the following values
const endpoint = process.env.ENDPOINT;
const apiKey = process.env.API_KEY;

app.post('/api/message', async (req, res) => {
    const userMessage = req.body.message;
    try {
      context.push(
          {
            "role": "user",
            "content": [
              {
              "type": "text",
              "text": userMessage
              }
            ]
          }
        );
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
          };
          
          console.log(context);

          // Request payload
          const payload = {
            "messages": context,
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


app.post('/api/ai-parameters', async (req, res) => {
  const parameters = await JSON.parse(req.body.message);

  if (req.body.message === undefined || parameters.quality === undefined || parameters.beh === undefined){
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  let message = "You are an interviewer at ";
  
  switch(parameters.quality){
    case 'great':
      message += "CoolCompanyCo. It is a great place to work at and has a lot of benefits.";
      break;

    case "good":
      message += "GoodCompanyCo. It is a good place to work at with its own benefits and drawbacks.";
      break;

    case "bad":
      message += "BadCompanyCo. It is an awful place to work at, but your task is to keep it from the interviewee."
      break;
  }

  message += " You have to conduct a technical interview and be ";

  switch(parameters.beh){
    case "enthusiastic":
      message += "interested and enthusiastic during this interview. Try to keep your answers on a short side.";
      break;

    case "stoic":
      message += "levelheaded and stoic during this interview.";
      break;

    case "dismissive":
      message += "adversarial and dismissive during this interview."
      break;
  }

  console.log(message);

  context[0] =
    {
      "role": "system",
      "content": [
        {
        "type": "text",
        "text": message
        }
      ]
    }
  ;
  res.sendStatus(200);
});


app.listen(3000, () => console.log('Server is running on port 3000'));