# URL Shortener

A simple REST API built with Node.js, Express, and MongoDB that shortens long URLs and tracks visit analytics.

## Tech Stack

- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **shortid** — short URL ID generation
- **dotenv** — environment variable management

## Project Structure

```
├── controllers/
│   └── url.js          # Business logic
├── models/
│   └── url.js          # Mongoose schema
├── routes/
│   └── url.js          # Route definitions
├── connect.js          # MongoDB connection
├── index.js            # Entry point
├── .env                # Your local config (gitignored)
└── .env.example        # Template for environment variables
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TechCoder-Abhi/url-shortener-with-analytics.git
   
   cd url-shortener-with-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3.
   Then open `.env` and fill in your values:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=8001
   ```

4. **Start the server**

   Production:
   ```bash
   npm start
   ```

   Development (auto-restart with nodemon):
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:8001`

---

## API Reference

### Create a Short URL

**POST** `/url`

**Request Body:**
```json
{
  "url": "https://www.example.com/some/very/long/url"
}
```

**Response:**
```json
{
  "id": "abc123",
  "shortUrl": "http://localhost:8001/url/abc123"
}
```

---

### Redirect to Original URL

**GET** `/url/:shortId`

Redirects the browser to the original URL and records the visit timestamp.

**Example:** `GET /url/abc123` → redirects to `https://www.example.com/...`

---

### Get Analytics

**GET** `/url/analytics/:shortId`

Returns total click count and visit history for a short URL.

**Response:**
```json
{
  "totalClicks": 3,
  "analytics": [
    { "_id": "...", "timestamp": "2026-03-17T10:00:00.000Z" },
    { "_id": "...", "timestamp": "2026-03-17T11:30:00.000Z" },
    { "_id": "...", "timestamp": "2026-03-17T14:15:00.000Z" }
  ]
}
```

