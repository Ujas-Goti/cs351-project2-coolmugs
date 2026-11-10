# Cool Mugs — CS351 Project 2

Cool Mugs is a group shop. The React app is the front end. Express is the API. MongoDB Atlas stores products, users, and orders.

Group members: Ujas, Alexia, Steven

## Run it locally

Use two terminals.

Server:

    cd server
    npm install
    node seed.js
    node server.js

Client:

    cd client
    npm install
    npm run dev

Open http://localhost:5173

Create `server/.env` with these names and your own values. Do not commit that file.

    MONGODB_URI
    MONGODB_DB
    SESSION_SECRET
    PORT

`node seed.js` loads the 25 mugs into the products collection and creates unique indexes on username and email.

## Deploy

From the repository root:

    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/coolmugs

    gcloud run deploy coolmugs --image gcr.io/YOUR_PROJECT_ID/coolmugs --region us-central1 --allow-unauthenticated --port 8080 --max-instances 1 --set-env-vars "MONGODB_URI=THE_REAL_URI,MONGODB_DB=coolmugs,SESSION_SECRET=THE_REAL_SECRET,NODE_ENV=production"

Put the real URI and secret only in the Cloud Run command. Steven adds the finished run.app URL here on Thursday.

## Who owns what

Ujas: database, server, products API, account API.
Alexia: account screens and the account video.
Steven: cart, checkout, Cloud Run, wiki, docs, and the Canvas submission.