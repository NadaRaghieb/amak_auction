const express = require("express");
const {
  placeBid,
  getMyBids,
  getAllBids,
  getAuctionBids,
  reviewBid,
  getHighestBidForAuction,
  markBidAsWinner,
} = require("../controllers/bidController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, placeBid);
router.get("/my", protect, getMyBids);
router.get("/", protect, adminOnly, getAllBids);
router.get("/auction/:auctionId", getAuctionBids);
router.get("/auction/:auctionId/highest", getHighestBidForAuction);
router.put("/:id/review", protect, adminOnly, reviewBid);
router.put("/:id/winner", protect, adminOnly, markBidAsWinner);

module.exports = router;