# USF-CSE
CSE Project at USF

# Project Setup and Usage Guide

## Prerequisites

1. **Install npm** (if you haven't done so already).
2. **Docker installed on your machine**
3. **Docker Compose installed (comes with Docker Desktop)**
4. **Install dependencies**:
   - Open the terminal
   - Go to the project's root folder and type:
   ```bash
   npm install
   ```

6. **Install Node.js**:
   ```bash
   npm install node
   ```

7. **Azure OpenAI API Key and Endpoint Setup** (skip this step if the .env file provided):
   - Log into [Azure](https://portal.azure.com/#home).
   - Click on the **Azure OpenAI** resource (check the "type" column) in the home tab.
   - In the **Overview** tab, click on "Go to Azure OpenAI Studio".
   - On the right, click on **Explore Azure AI Studio**.
   - Go to the **Deployments** tab.
   - Select an existing deployment or create a new one (e.g., `gpt-4o-mini` is the most affordable option).
   - You will find the **Target URI** and **API Key** on the right.

9. **Create a `.env` file** in the `/test-server` folder and insert the following lines (skip this step if the .env file provided):
   ```bash
   API_KEY=""
   CHAT_COMPLETION_ENDPOINT=""
   ASSISTANT_ENDPOINT=""
   REGION=""
   AI_VERSION=""
   ASSISTANT_ID=""
   VECTOR_STORE_ID = ""
   CAPSTONE_AZURE_AI_SERVICE_KEY = ""
   CAPSTONE_AZURE_AI_SERVICE_ENDPOINT = ""
   ```
10. **Install docker image**:
    In the root folder run
    ```bash
    docker load -i ai-interviewer.tar
    ``` 

## How to Run

1. You will need **three terminals**.

2. **First terminal**: 
   - Navigate to the project's root folder and run:
   ```bash
   npm run dev
   ```

3. **Second terminal**:
   - Navigate to the `/test-server` folder and run:
   ```bash
   node app.js
   ```
4. **Third terminal**:
   ```bash
   docker run -d -p 6379:6379 redis/redis-stack-server:latest
   ```
   - use ```docker ps``` to check that the container is running

---

That's it! The project should now be running unless we've exhausted our quota.

### Notes:
- Avoid spamming the API with unnecessary tests.
- You can test your queries in the **Azure AI Studio Playground** for a better experience.
