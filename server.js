import express from "express";
import axios from "axios";
import path from "path";
import llmApi from "./src/utils/llm.js";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

const app = express();
const port = process.env.PORT;

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS globally (handles preflight too)
app.use(cors());

// Simple health endpoint (optional)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
const fetchProperties = async (propertiesRequirements) => {
  const options = {
    method: "GET",
    url: "https://zillow56.p.rapidapi.com/search",
    params: {
      location: "seattle",
      status: "forSale",
      beds: propertiesRequirements.bedrooms,
      baths: propertiesRequirements.bathrooms,
      price_min: propertiesRequirements.min_price,
      price_max: propertiesRequirements.max_price,
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_ZILLOW_API_KEY,
      "X-RapidAPI-Host": "zillow56.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const results = response.data.results || [];

    // ✅ Post-filter to enforce *all* conditions
    return results.filter((p) => {
      const bedroomsOk =
        !propertiesRequirements.bedrooms ||
        p.bedrooms === propertiesRequirements.bedrooms;
      const bathroomsOk =
        !propertiesRequirements.bathrooms ||
        p.bathrooms === propertiesRequirements.bathrooms;
      const priceOk =
        (!propertiesRequirements.min_price ||
          p.price >= propertiesRequirements.min_price) &&
        (!propertiesRequirements.max_price ||
          p.price <= propertiesRequirements.max_price);

      return bedroomsOk && bathroomsOk && priceOk; 
    });
  } catch (error) {
    console.error(
      "Error fetching properties from Zillow:",
      error?.message || error
    );
    return [];
  }
};

app.post("/api/parse-properties", async function (req, res) {
  try {
    console.log("parse properties request body:", req.body);

    const requirements = req.body?.post;
    if (!requirements) {
      return res.status(400).json({ error: "Missing 'post' in request body" });
    }

    // 1) Convert user text to structured query via LLM util
    const llmResponse = await llmApi(requirements);
    console.log("llmResponse:", llmResponse);

    // 2) Normalize values (LLM might return numbers or strings)
    const propertiesRequirements = {
      min_price: Number(llmResponse?.min_price) || 1000000,
      max_price: Number(llmResponse?.max_price) || 30000000,
      bedrooms: Number(llmResponse?.bedrooms) || 1,
      bathrooms: Number(llmResponse?.bathrooms) || 1,
    };

    console.log("propertiesRequirements (normalized):", propertiesRequirements);

    // 3) Call Zillow (or RapidAPI) to fetch properties
    const propertiesResponse = await fetchProperties(propertiesRequirements);
    console.log("propertiesResponse length:", propertiesResponse?.length || 0);

    // 4) Send result to frontend
    // (cors middleware already added globally)
    console.log(
      "sending response to frontend, first item preview:",
      propertiesResponse?.[0] ?? "no items"
    );
    return res.json(propertiesResponse);
  } catch (err) {
    console.error("Error in /api/parse-properties:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, function () {
  console.log(`app is running at port: ${port}`);
});
