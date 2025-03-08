const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3000;
const tokenRoutes = require("./routes/agora");

// Use CORS middleware with specific origin
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ["http://localhost:5173", "https://uora.vercel.app"];
        console.log("Request Origin:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use("/api", tokenRoutes);

app.listen(port, () => { 
    console.log(`Server Started At ${port}`);
});
