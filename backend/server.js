require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("KM Backend is running ✅");
});

let cache = null;
let lastFetch = 0;
const CACHE_TTL = 0;


app.get("/api/km", async (req, res) => {
    try {
        const now = Date.now();

        if (cache && now - lastFetch < CACHE_TTL) {
            return res.json(cache);
        }

        const response = await axios.get(process.env.API_URL, {
            headers: {
                "x-api-key": process.env.API_KEY
            }
        });

        const km = response.data.find(d => d.metric === "KM");

        if (!km) {
            return res.status(404).json({ error: "KM metric not found" });
        }

        cache = km;
        lastFetch = now;

        res.json(km);
    } catch (err) {
        console.error("Fetch error:", err.message);
        res.status(500).json({ error: "API fetch failed" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Node server running on port ${PORT}`);
});
