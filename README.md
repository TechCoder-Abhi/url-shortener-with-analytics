# URL Shortener

A simple REST API built with Node.js, Express, and MongoDB that shortens long URLs and tracks visit analytics.

## Tech Stack

- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **shortid** — short URL ID generation
- **dotenv** — environment variable management

## Features

- Create short URLs from long links
- Optional custom short alias support
- Alias validation (4-30 chars, letters/numbers/_/-)
- Alias uniqueness check with conflict response
- Auto-generate short IDs when alias is not provided
- URL normalization (auto-add https:// when protocol is missing)
- URL validation (accepts only http/https links)
- Redirect to original URL using short path
- Click tracking on each redirect
- Analytics endpoint with click history
- Metadata endpoint for a short URL
- Auto timestamps with createdAt and updatedAt
- IST-friendly time fields in API responses
- Consistent JSON error responses for invalid/missing data

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
  "url": "https://www.example.com/some/very/long/url",
  "customAlias": "my-link-2026"
}
```

`customAlias` is optional. If provided, it must be 4-30 characters and can include letters, numbers, `_`, and `-`.

If protocol is missing, the API auto-normalizes the URL to `https://...`.

**Response:**
```json
{
  "id": "my-link-2026",
  "shortUrl": "http://localhost:8001/url/my-link-2026"
}
```

**Error Cases:**
- `400` for invalid URL or invalid alias format
- `409` if `customAlias` is already taken

---

### Redirect to Original URL

**GET** `/url/:shortId`

Redirects the browser to the original URL and records the visit timestamp.

**Example:** `GET /url/abc123` → redirects to `https://www.example.com/...`

---

### Get Analytics

**GET** `/url/analytics/:shortId`

Returns total click count and visit history for a short URL.

Timestamps are returned in UTC (`timestamp`) and IST (`timestampIST`).

**Response:**
```json
{
  "totalClicks": 3,
  "timezone": "Asia/Kolkata",
  "analytics": [
    {
      "_id": "...",
      "timestamp": "2026-03-17T10:00:00.000Z",
      "timestampIST": "17/03/2026, 15:30:00"
    },
    {
      "_id": "...",
      "timestamp": "2026-03-17T11:30:00.000Z",
      "timestampIST": "17/03/2026, 17:00:00"
    },
    {
      "_id": "...",
      "timestamp": "2026-03-17T14:15:00.000Z",
      "timestampIST": "17/03/2026, 19:45:00"
    }
  ]
}
```

---

### Get URL Metadata

**GET** `/url/meta/:shortId`

Returns metadata for a short URL.

**Response:**
```json
{
  "id": "abc123",
  "redirectUrl": "https://www.example.com/some/very/long/url",
  "shortUrl": "http://localhost:8001/url/abc123",
  "createdAt": "2026-03-18T10:00:00.000Z",
  "createdAtIST": "18/03/2026, 15:30:00",
  "updatedAt": "2026-03-18T10:05:00.000Z",
  "updatedAtIST": "18/03/2026, 15:35:00",
  "timezone": "Asia/Kolkata",
  "totalClicks": 3
}
```
