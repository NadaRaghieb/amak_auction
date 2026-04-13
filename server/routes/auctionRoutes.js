const express = require("express");
const {
  createAuction,
  getAllAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  changeAuctionStatus,
  getAuctionViewerCounts,
} = require("../controllers/auctionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllAuctions);
router.get("/viewer-counts/all", getAuctionViewerCounts);
router.get("/:id", getAuctionById);

router.post("/", protect, adminOnly, createAuction);
router.put("/:id", protect, adminOnly, updateAuction);
router.delete("/:id", protect, adminOnly, deleteAuction);
router.patch("/:id/status", protect, adminOnly, changeAuctionStatus);

module.exports = router;