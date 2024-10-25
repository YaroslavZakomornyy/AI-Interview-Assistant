require("dotenv").config();
const endpoint = process.env.ENDPOINT;
const apiKey = process.env.API_KEY;
const openAiVersion = process.env.AI_VERSION;
const assistantId = process.env.ASSISTANT_ID;
if (!apiKey || !endpoint || !openAiVersion || !assistantId) {
  throw new Error("Please set API_KEY, ENDPOINT, AI_VERSION and ASSISTANT_ID in your environment variables.");
}

// import { AzureOpenAI } from "openai";

// let activeThreads = {
//   "1": ""
// }

// const getClient = () => {
//   const assistantsClient = new AzureOpenAI({
//     endpoint: endpoint,
//     apiVersion: openAiVersion,
//     apiKey: apiKey
//   });
//   return assistantsClient;
// };

// const assistant = getClient();

// const createNewThread = async () => {
//   try {
//     // Create a thread
//     const assistantThread = await assistant.beta.threads.create();
//     console.log(`Thread created: ${JSON.stringify(assistantThread)}`);

//     return assistantThread.id;

//   } catch (error) {
//     console.error(`Error running the assistant: ${error.message}`);
//     return -1;
//   }
// };



// const setupAssistant = async () => {
//   try {
//     const assistantResponse = await assistant.beta.assistants.retrieve(assistantId)
//     console.log(`Assistant retrieved: ${JSON.stringify(assistantResponse)}`);
//   } catch (error) {
//     console.error(`Error retrieving assistant: ${error.message}`);
//   }
// };

// setupAssistant();

// export const sendMessage = async (message) => {
//     try {
//         const response = await api.post('/message', {
//             message
//         }, {
//             headers:{
//                 'Content-Type': 'application/json',
//                 'X-User-ID': USER_ID  
//             }
//         });
//         return response.data.choices[0].message.content;
    
//     } catch (error) {

//         if (error.code === "ERR_NETWORK"){
//             return "Error! Server refused connection!";
//         }
//         else{
//             console.error('Error:', error);
//             return "Error! " + error;
//         }
        
//     }
// };

// app.post('/api/chat/message', async (req, res) => {
  

//   try{
//     if (!activeThreads[userId]){
//       activeThreads[userId] = await createNewThread();
//     }
//     const thread = activeThreads[userId];

//     if (!thread){
//       throw new Error("Thread is undefined!");
//     }
  
//     const message = assistant.beta.threads.messages.create(
//       thread, {
//         role: 'user',
//         content: userMessage
//       }
//     );

    
//   }
//   catch(err){
//     console.error(err);

//     return res.status(500).json({error: 'Internal server error'});
//   }

//   console.log("Message created: ")
  
  
//   // const message = assistant.beta.threads.messages.create(
//   //     threadId: (await currentThread).id,

//   // )

//   //   // Make the HTTP request
//   //   const response = await axios.post(endpoint, payload, { headers });

//   //   context.push(
//   //     response.data.choices[0].message
//   //   );

//   //   // Send response back to client
//   //   res.status(200).json(response.data);
//   // } catch (error)
//   // {
//   //   console.error(error);
//   //   res.status(500).json({ error: 'Error with OpenAI API' });
//   // }
// });