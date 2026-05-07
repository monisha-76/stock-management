const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://stock-management-omega-vert.vercel.app",
    "https://frontend-react-ten-taupe.vercel.app",
    "http://16.171.138.104:5173"
  ],
  credentials: true,
}));

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/purchase", require("./routes/purchaseRoute"));
app.use("/api/requests", require("./routes/productRequestRoutes"));
app.use("/api/offers", require("./routes/sellerOfferRoutes"));

module.exports = app;