# 🏡 Home Search App (Seattle Real Estate LLM Parser)

## 📖 Overview

The **Home Search App** is an AI-powered real estate search tool that allows users to type natural language queries such as:

> *"Looking for a 3-bedroom house in Seattle with 3 bathrooms, priced between 1M and 2M."*

The app then:

1. Parses the query using **LangChain** and **Google Gemini API**.
2. Converts the description into structured JSON with user preferences.
3. Passes the structured data to the **Zillow API** (or mock dataset) to filter properties.
4. Displays relevant results on a **React frontend**.

This project demonstrates how to combine **LLMs, Express.js, and third-party APIs** to create an intelligent property search engine.

---

## ⚙️ Tech Stack

* **Frontend**: React.js
* **Backend**: Express.js (Node.js)
* **AI/LLM**: Google Gemini API via LangChain
* **Schema Parsing**: Zod + StructuredOutputParser
* **Real Estate Data**: Zillow API (or mock JSON for testing)
* **Environment Config**: dotenv with `.env.local`

---

## 📂 Project Structure

```
root/
│── .env.local                # API keys (Gemini, Zillow)
│── server.js                 # Express server entry point
│── src/
│    ├── App.jsx              # React frontend
│    ├── utils/
│    │    └── llm.js          # LangChain + Gemini API integration
│    └── components/          # UI components
```

---

## 🧠 How It Works

1. **User Input (Frontend)**

   * User types a natural query in the search box.
   * Example: `"I want a home in Seattle near a railway station within 10 mins walk, with a school under 5 km and a hospital within 1 km, budget 1M–2M."`

2. **Parsing (Backend)**

   * `llm.js` uses **LangChain** + **Gemini** to parse the query.
   * Structured JSON is returned, e.g.:

     ```json
     {
       "min_price": 1000000,
       "max_price": 2000000,
       "bedrooms": 3,
       "bathrooms": 3
     }
     ```

3. **Filtering (Zillow API)**

   * Express server takes structured JSON.
   * Queries Zillow API (or mock data) with filters.
   * Ensures **all parameters must match** before returning results.

4. **Display (Frontend)**

   * React renders the list of properties.
   * User sees only homes matching **all criteria**.

---

## 📝 Example Request/Response

### Input:

```
"Looking for 3 bedroom house in Seattle with 3 bathrooms. Price between 1M and 2M."
```

### LLM Parsed Output:

```json
{
  "min_price": 1000000,
  "max_price": 2000000,
  "bedrooms": 3,
  "bathrooms": 3
}
```

### Zillow API Response (Sample):

```json
[
  {
    "id": "12345",
    "address": "123 Lakeview Ave, Seattle, WA",
    "price": 1500000,
    "bedrooms": 3,
    "bathrooms": 3,
    "near_school": true,
    "near_hospital": true
  }
]
```

---

## 🚀 Running the App

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/home-search-app.git
cd home-search-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in root:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_key
ZILLOW_API_KEY=your_zillow_key
```

### 4. Start the Backend

```bash
node server.js
```

### 5. Start the Frontend

```bash
npm run dev
```

---

## 🏗️ Future Enhancements

* ✅ Add location-based filtering (distance to schools, hospitals, stations)
* ✅ Multi-parameter strict filtering (all conditions must match)
* ⏳ Integrate real Zillow API (current version supports mock data)
* ⏳ Deploy to cloud with CI/CD pipelines

---

## 🤝 Contributors

* **Aditya Raj Singh Ranawat** – Full Stack Development, AI Integration
* **ChatGPT (Assistant)** – Architecture, Debugging, Documentation

---

## 📜 License

MIT License – Free to use and modify.
