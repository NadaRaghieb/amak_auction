const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { getAllViewerCounts } = require("../utils/auctionViewerStore");

const createAuction = async (req, res) => {
  try {
    const {
      title_en,
      title_ar,
      model_en,
      model_ar,
      description_en,
      description_ar,
      features_en,
      features_ar,
      defects_en,
      defects_ar,
      category_en,
      category_ar,
      serialNumber,
      usageHours,
      startingPrice,
      images,
      status,
      auctionStart,
      auctionEnd,
    } = req.body;

    if (
      !title_en ||
      !title_ar ||
      !model_en ||
      !model_ar ||
      !description_en ||
      !description_ar ||
      !startingPrice ||
      !auctionStart ||
      !auctionEnd
    ) {
      return res.status(400).json({
        message: "Please provide all required auction fields",
      });
    }

    const auction = await Auction.create({
      title_en,
      title_ar,
      model_en,
      model_ar,
      description_en,
      description_ar,
      features_en,
      features_ar,
      defects_en,
      defects_ar,
      category_en,
      category_ar,
      serialNumber,
      usageHours,
      startingPrice,
      images,
      status,
      auctionStart,
      auctionEnd,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating auction",
      error: error.message,
    });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });

    const auctionsWithStats = await Promise.all(
      auctions.map(async (auction) => {
        const bids = await Bid.find({ auctionId: auction._id }).select("userId bidAmount");

        const bidCount = bids.length;
        const bidderCount = new Set(
          bids.map((bid) => bid.userId.toString())
        ).size;

        const highestBidAmount =
          bids.length > 0
            ? Math.max(...bids.map((bid) => bid.bidAmount))
            : 0;

        const currentPrice = highestBidAmount || auction.startingPrice;

        return {
          ...auction.toObject(),
          bidCount,
          bidderCount,
          highestBidAmount,
          currentPrice,
        };
      })
    );

    return res.status(200).json({
      count: auctionsWithStats.length,
      auctions: auctionsWithStats,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching auctions",
      error: error.message,
    });
  }
};

const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    const bids = await Bid.find({ auctionId: auction._id }).select("userId bidAmount");

    const bidCount = bids.length;
    const bidderCount = new Set(
      bids.map((bid) => bid.userId.toString())
    ).size;

    const highestBidAmount =
      bids.length > 0
        ? Math.max(...bids.map((bid) => bid.bidAmount))
        : 0;

    const currentPrice = highestBidAmount || auction.startingPrice;

    return res.status(200).json({
      auction: {
        ...auction.toObject(),
        bidCount,
        bidderCount,
        highestBidAmount,
        currentPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching auction",
      error: error.message,
    });
  }
};

const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Auction updated successfully",
      auction: updatedAuction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating auction",
      error: error.message,
    });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    const existingBids = await Bid.countDocuments({ auctionId: auction._id });

    if (existingBids > 0) {
      return res.status(400).json({
        message: "Cannot delete auction because it already has bids",
      });
    }

    await auction.deleteOne();

    return res.status(200).json({
      message: "Auction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting auction",
      error: error.message,
    });
  }
};

const changeAuctionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["draft", "upcoming", "live", "ended", "closed", "sold"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid auction status",
      });
    }

    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    auction.status = status;
    await auction.save();

    return res.status(200).json({
      message: "Auction status updated successfully",
      auction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating auction status",
      error: error.message,
    });
  }
};

const getAuctionViewerCounts = async (req, res) => {
  try {
    const viewerCounts = getAllViewerCounts();

    return res.status(200).json({
      viewerCounts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching viewer counts",
      error: error.message,
    });
  }
};

module.exports = {
  createAuction,
  getAllAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  changeAuctionStatus,
  getAuctionViewerCounts,
};