# Cool Mugs — CS351 Project 2

Cool Mugs is a group online mug shop built with React, Express, and MongoDB Atlas. The React application provides the storefront and shopping interface. Express handles API requests, user sessions, cart operations, and checkout. MongoDB Atlas stores products, users, and orders.

**Live website:** [https://coolmugs-54309975415.us-west1.run.app](https://coolmugs-54309975415.us-west1.run.app)

**Group members:** Ujas, Alexia, Steven

## Features

- Browse the mug catalog, with 25 products loaded from MongoDB Atlas.
- Create an account, log in, edit account information, and log out.
- Add mugs to a session-based shopping cart.
- Change item quantities and remove items from the cart.
- Keep cart contents when refreshing the page.
- Check out with shipping and billing information.
- Calculate subtotal, 9% tax, shipping, and order total on the server.
- Save completed orders to MongoDB Atlas.
- View previous orders from the account dashboard.

The application uses Express sessions to maintain the shopping cart and logged-in user. Passwords are hashed before being stored. Only the card type and last four digits are stored; full card numbers and CVVs are not collected or saved.

## Run it locally

You need Node.js and npm installed, along with a MongoDB Atlas database.

### 1. Configure environment variables

Create `server/.env` with your own values:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=coolmugs
SESSION_SECRET=your_long_random_secret
PORT=3000
```

Do not commit `server/.env` or share its real credentials.

### 2. Start the server

Open the first terminal from the repository root:

```powershell
cd server
npm install
node seed.js
node server.js
```

Run `node seed.js` when setting up or reseeding the database. It loads the 25 mugs from `server/data/products.json` into the products collection and creates unique indexes for usernames and email addresses.

The Express server runs on port 3000 by default.

### 3. Start the React client

Open a second terminal from the repository root:

```powershell
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite development server proxies `/api` requests to the Express server.

## Project structure

```text
project2-coolmugs/
├── client/
│   └── src/
│       ├── components/
│       └── views/
├── server/
│   ├── data/
│   │   └── products.json
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   ├── seed.js
│   └── server.js
├── docs/
├── Dockerfile
├── .dockerignore
└── README.md
```

## Deployment

The application is deployed as a single Google Cloud Run service. Cloud Build builds the Docker image, Artifact Registry stores it, and Secret Manager securely supplies the MongoDB URI and session secret.

**Live deployment:** [https://coolmugs-54309975415.us-west1.run.app](https://coolmugs-54309975415.us-west1.run.app)

The deployment uses the following configuration:

- Google Cloud project: `coolmugs-cs351-2026`
- Artifact Registry repository: `coolmugs-repo`
- Region: `us-west1`
- Cloud Run service: `coolmugs`
- Container port: `8080`
- Database: MongoDB Atlas, `coolmugs`

### Build the Docker image

From the repository root:

```powershell
gcloud builds submit --tag us-west1-docker.pkg.dev/coolmugs-cs351-2026/coolmugs-repo/coolmugs
```

### Deploy to Cloud Run

```powershell
gcloud run deploy coolmugs --image=us-west1-docker.pkg.dev/coolmugs-cs351-2026/coolmugs-repo/coolmugs --region=us-west1 --platform=managed --allow-unauthenticated --max=1 --set-env-vars="MONGODB_DB=coolmugs,NODE_ENV=production" --set-secrets="MONGODB_URI=coolmugs-mongodb-uri:latest,SESSION_SECRET=coolmugs-session-secret:latest"
```

The MongoDB URI and session secret are stored in Google Cloud Secret Manager and are not included in this README or the Docker image.

The Cloud Run service listens on the port supplied by the `PORT` environment variable. The maximum instance count is limited to one to accommodate the Express in-memory session store used by this project.

## Who owns what

- **Ujas:** MongoDB Atlas database, Express server, products API, and account API.
- **Alexia:** Account screens, account functionality, and account demonstration video.
- **Steven:** Cart functionality, checkout, order history integration, Cloud Run deployment, wiki, documentation, and Canvas submission.

## Technologies used

- React
- Vite
- Node.js
- Express
- MongoDB Atlas
- MongoDB Node.js Driver
- Express Session
- bcryptjs
- Docker
- Google Cloud Build
- Google Artifact Registry
- Google Cloud Run
- Google Cloud Secret Manager
