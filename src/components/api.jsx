import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Replace with your server's URL
});

export const fetchOpenAIResponse = async (prompt) => {
  try {
    const response = await api.post('/message', { prompt });
    return response.data.completion;  // Assuming server returns a 'completion' field
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    throw error;
  }
};
