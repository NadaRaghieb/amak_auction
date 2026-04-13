const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const totalBids = await Bid.countDocuments();

    const liveAuctions = await Auction.countDocuments({ status: "live" });
    const endedAuctions = await Auction.countDocuments({ status: "ended" });

    const recentBids = await Bid.find()
      .populate("userId", "name email")
      .populate("auctionId", "title_en title_ar")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalAuctions,
        totalBids,
        liveAuctions,
        endedAuctions,
      },
      recentBids,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};