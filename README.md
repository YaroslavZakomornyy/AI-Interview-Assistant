# USF-CSE
CSE Project at USF

Prerequisites:
    You will need to install the npm if you haven't done so yet.
    Now to initialize the project (you have to do it once):
        - Open the terminal
        - Go to the project's root folder and type:

                npm install
        
        That will install your dependencies.
    
    Install Node.js:

        npm install node
    

    Azure OpenAI API key and the endpoint. You can get them this way:
        - Log into the Azure.
        - Click on the Azure OpenAI resource (check the type column) in the home tab (https://portal.azure.com/#home).
        - In the overview tab click on the "Go to Azure OpenAI Studio".
        - On the right click on the Explore Azure AI Studio.
        - Go to the deployments tab.
        - Pick the one you want or create a new one (gpt-4o-mini is the cheapest one).
        - On the right you will see the Target URI and Key.
        - Create the .env file in the /test-server.
        - Insert the following lines:
            
            API_KEY="YOUR KEY"
            ENDPOINT="YOUR ENDPOINT"
        
To Run:
    You will need to terminals. In the first terminal go to the project's root folder and type:

        npm run dev

    In the second terminal go to the /test-server folder and type:

        node app.js

That's it! Unless we exhaust our quota, it will work just fine. Make sure not to spam it with useless tests and rather test it in the Azure AI Studio playground.