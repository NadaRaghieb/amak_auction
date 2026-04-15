const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

//CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://amak-auction.vercel.app", // رابط الفرونت
    ],
    credentials: true,
  })
);

// مهم جدًا
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/", (req, res) => {
  res.send("AMAK Auction API Running");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;