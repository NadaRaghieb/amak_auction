const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title_en: {
      type: String,
      required: [true, "English title is required"],
      trim: true,
    },
    title_ar: {
      type: String,
      required: [true, "Arabic title is required"],
      trim: true,
    },
    model_en: {
      type: String,
      required: [true, "English model is required"],
      trim: true,
    },
    model_ar: {
      type: String,
      required: [true, "Arabic model is required"],
      trim: true,
    },
    description_en: {
      type: String,
      required: [true, "English description is required"],
      trim: true,
    },
    description_ar: {
      type: String,
      required: [true, "Arabic description is required"],
      trim: true,
    },
    features_en: {
      type: String,
      default: "",
      trim: true,
    },
    features_ar: {
      type: String,
      default: "",
      trim: true,
    },
    defects_en: {
      type: String,
      default: "",
      trim: true,
    },
    defects_ar: {
      type: String,
      default: "",
      trim: true,
    },
    category_en: {
      type: String,
      default: "",
      trim: true,
    },
    category_ar: {
      type: String,
      default: "",
      trim: true,
    },
    serialNumber: {
      type: String,
      default: "",
      trim: true,
    },
    usageHours: {
      type: Number,
      default: 0,
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Starting price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "upcoming", "live", "ended", "closed", "sold"],
      default: "draft",
    },
    auctionStart: {
      type: Date,
      required: [true, "Auction start date is required"],
    },
    auctionEnd: {
      type: Date,
      required: [true, "Auction end date is required"],
    },
    resultEmailSent: {
      type: Boolean,
      default: false,
    },
    finalized: {
      type: Boolean,
      default: false,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    winnerBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },
    winnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    winningAmount: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);