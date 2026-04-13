// const Auction = require("../models/Auction");
// const Bid = require("../models/Bid");
// const {
//   sendAuctionEndedEmail,
//   sendWinnerEmail,
// } = require("../services/emailService");

// const checkEndedAuctions = async () => {
//   try {
//     const now = new Date();

//     const endedAuctions = await Auction.find({
//       auctionEnd: { $lte: now },
//       finalized: false,
//     });

//     for (const auction of endedAuctions) {
//       const highestBid = await Bid.findOne({ auctionId: auction._id })
//         .populate("userId", "name email")
//         .sort({ bidAmount: -1 });

//       if (highestBid) {
//         await Bid.updateMany(
//           { auctionId: auction._id, _id: { $ne: highestBid._id } },
//           { status: "lost" }
//         );

//         highestBid.status = "winner";
//         await highestBid.save();

//         auction.winnerBidId = highestBid._id;
//         auction.winnerUserId = highestBid.userId?._id || null;
//         auction.winningAmount = highestBid.bidAmount;
//       }

//       auction.finalized = true;
//       auction.closedAt = now;
//       auction.status = "ended";

//       if (!auction.resultEmailSent) {
//         await sendAuctionEndedEmail({
//           auctionTitle: auction.title_en,
//           highestBidAmount: highestBid?.bidAmount || null,
//           highestBidderName: highestBid?.userId?.name || null,
//           highestBidderEmail: highestBid?.userId?.email || null,
//         });

//         if (highestBid?.userId?.email) {
//           await sendWinnerEmail({
//             email: highestBid.userId.email,
//             name: highestBid.userId.name,
//             auctionTitle: auction.title_en,
//             winningAmount: highestBid.bidAmount,
//           });
//         }

//         auction.resultEmailSent = true;
//       }

//       await auction.save();
//     }
//   } catch (error) {
//     console.error("checkEndedAuctions error:", error.message);
//   }
// };

// module.exports = checkEndedAuctions;