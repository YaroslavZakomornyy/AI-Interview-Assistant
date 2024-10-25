import dotenv from "dotenv";
import axios from "axios";
import redisClient from "../redis-client";
import messagePreprocessor from "../services/message_preprocessor";

dotenv.config();

const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;

const appendNewMessage = (messageHistory, newMessage, role) => {
    messageHistory.push(
        {
            "role": role,
            "content": [
                {
                    "type": "text",
                    "text": newMessage
                }
            ]
        }
    );
}

const sendMessage = async (req, res, next) => {
    const userId = req.headers['X-User-ID'];

    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const userMessage = req.body.message;
    if (!userMessage)
    {
        return res.status(400).json({ error: 'Message is required' });
    }

    //TODO: Should make async!
    

    const history = redisClient.get(userId);

    appendNewMessage(history, userMessage, 'user');

    try
    {
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
        };

        // Request payload
        const payload = {
            "messages": history,
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 200
        };

        // Make the HTTP request
        const response = await axios.post(endpoint, payload, { headers });

        appendNewMessage(history, response.data.choices[0].message, 'assistant');
        redisClient.set(userId, history);
        // Send response back to client
        return res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error with OpenAI API' });
    }
}


const setParameters = async (req, res) => {
    const userId = req.headers['X-User-ID'];

    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const parameters = await JSON.parse(req.body.message);

  if (req.body.message === undefined || parameters.quality === undefined || parameters.beh === undefined)
  {
    return res.status(400).json({ error: 'Some parameters are missing.' });
  }

  const message = messagePreprocessor.buildParameterQuery({
    behavior: parameters.beh,
    workplace_quality: parameters.quality,
    interview_style: parameters.int
  });

  console.log(message);
  
  const params =
  [
    {
        "role": "system",
        "content": [
        {
            "type": "text",
            "text": message
        }
        ]
    }  
  ];
  
  if (redisClient.contains(userId)) redisClient.set(userId, params);
  return res.sendStatus(204);
}


export default {
    sendMessage, setParameters
}