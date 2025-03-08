const express = require('express');
const cors = require('cors'); // Import CORS
const app = express();
const port = 3000;
const tokenRoutes = require("./routes/agora");

// Use CORS middleware
app.use(cors());

app.get('/', (req, res) => {
    res.json("Hello World");
});

app.use("/api", tokenRoutes);

app.listen(port, () => { 
    console.log(`Server Started At ${port}`);
});
