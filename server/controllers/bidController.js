const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const { sendWinnerEmail } = require("../services/emailService");

function getBidIncrement(price) {
  if (price < 10000) return 100;
  if (price < 100000) return 500;
  return 1000;
}

const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount, note } = req.body;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({
        message: "Auction ID and bid amount are required",
      });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    const now = new Date();

    if (
      auction.finalized ||
      auction.status === "ended" ||
      auction.status === "closed" ||
      auction.status === "sold"
    ) {
      return res.status(400).json({
        message: "Auction is already closed",
      });
    }

    if (auction.status !== "live") {
      return res.status(400).json({
        message: "This auction is not live",
      });
    }

    if (now < new Date(auction.auctionStart)) {
      return res.status(400).json({
        message: "Auction has not started yet",
      });
    }

    if (now > new Date(auction.auctionEnd)) {
      return res.status(400).json({
        message: "Auction has ended",
      });
    }

    const highestBid = await Bid.findOne({ auctionId }).sort({ bidAmount: -1 });

    const currentPrice = highestBid
      ? highestBid.bidAmount
      : auction.startingPrice;

    const increment = getBidIncrement(currentPrice);
    const minimumAllowedBid = currentPrice + increment;

    if (Number(bidAmount) <= currentPrice) {
      return res.status(400).json({
        message: "Bid must be higher than current price",
      });
    }

    if (Number(bidAmount) < minimumAllowedBid) {
      return res.status(400).json({
        message: `Minimum next bid is ${minimumAllowedBid}`,
      });
    }

    const bid = await Bid.create({
      auctionId,
      userId: req.user._id,
      bidAmount: Number(bidAmount),
      note,
    });

    let extended = false;
    const remainingMs = new Date(auction.auctionEnd).getTime() - now.getTime();

    if (remainingMs > 0 && remainingMs <= 30000) {
      auction.auctionEnd = new Date(now.getTime() + 30000);
      await auction.save();
      extended = true;
    }

    const io = req.app.get("io");

    if (io) {
      io.to(auctionId.toString()).emit("newBid", {
        auctionId: auctionId.toString(),
        bidAmount: Number(bidAmount),
        user: req.user.name,
        time: new Date(),
        extended,
        newEnd: auction.auctionEnd,
      });
    }

    return res.status(201).json({
      message: "Bid placed successfully",
      bid,
      extended,
      auctionEnd: auction.auctionEnd,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while placing bid",
      error: error.message,
    });
  }
};

const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ userId: req.user._id })
      .populate("auctionId", "title_en title_ar status winningAmount")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bids.length,
      bids,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching user bids",
      error: error.message,
    });
  }
};

const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate(
        "userId",
        "name email phone identityType identityNumber"
      )
      .populate("auctionId", "title_en title_ar status winningAmount")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bids.length,
      bids,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching bids",
      error: error.message,
    });
  }
};

const getAuctionBids = async (req, res) => {
  try {
    const bids = await Bid.find({
      auctionId: req.params.auctionId,
    })
      .populate(
        "userId",
        "name email phone identityType identityNumber"
      )
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      count: bids.length,
      bids,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching auction bids",
      error: error.message,
    });
  }
};

const reviewBid = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected", "reviewed", "contacted"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    bid.status = status;
    await bid.save();

    return res.status(200).json({
      message: "Bid updated successfully",
      bid,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating bid",
      error: error.message,
    });
  }
};

const getHighestBidForAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    const highestBid = await Bid.findOne({
      auctionId: req.params.auctionId,
    })
      .populate("userId", "name email phone identityType identityNumber")
      .sort({ bidAmount: -1 });

    const currentPrice = highestBid
      ? highestBid.bidAmount
      : auction.startingPrice;

    const increment = getBidIncrement(currentPrice);
    const minimumNextBid = currentPrice + increment;

    return res.status(200).json({
      highestBid,
      minimumNextBid,
      increment,
      finalized: auction.finalized,
      winningAmount: auction.winningAmount,
      winnerUserId: auction.winnerUserId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching highest bid",
      error: error.message,
    });
  }
};

const markBidAsWinner = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    const auction = await Auction.findById(bid.auctionId);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    await Bid.updateMany(
      { auctionId: bid.auctionId, _id: { $ne: bid._id } },
      { status: "lost" }
    );

    bid.status = "winner";
    await bid.save();

    auction.winnerBidId = bid._id;
    auction.winnerUserId = bid.userId?._id || bid.userId;
    auction.winningAmount = bid.bidAmount;
    auction.finalized = true;
    auction.closedAt = new Date();
    auction.status = "ended";
    auction.resultEmailSent = true;
    await auction.save();

    if (bid.userId?.email) {
      await sendWinnerEmail({
        email: bid.userId.email,
        name: bid.userId.name,
        auctionTitle: auction.title_en,
        winningAmount: bid.bidAmount,
      });
    }

    return res.status(200).json({
      message: "Winner selected successfully",
      bid,
      auction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while selecting winner",
      error: error.message,
    });
  }
};

module.exports = {
  placeBid,
  getMyBids,
  getAllBids,
  getAuctionBids,
  reviewBid,
  getHighestBidForAuction,
  markBidAsWinner,
};