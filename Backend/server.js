const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const userRoute = require("./routes/userRoute");

connectDB();

app.use(cors());
app.use(express.json());
app.use("/bms/users", userRoute);

// Start the server
const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });