import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import { useAuth } from "../context/useAuth";

function AuctionDetails() {
  const { id } = useParams();
  const { language, isArabic } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];

  const [auction, setAuction] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [minimumNextBid, setMinimumNextBid] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [bids, setBids] = useState([]);
  const [winnerName, setWinnerName] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [showConfirmBid, setShowConfirmBid] = useState(false);

  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [winnerChecked, setWinnerChecked] = useState(false);

  const getText = (item, key) => {
    if (isArabic) {
      return item?.[`${key}_ar`] || item?.[`${key}_en`] || "";
    }
    return item?.[`${key}_en`] || item?.[`${key}_ar`] || "";
  };

  const currentUserId = useMemo(() => {
    if (!user) return null;
    return user.id || user._id || null;
  }, [user]);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return String(value._id);
    return String(value);
  };

  const refreshAuctionData = async () => {
    try {
      const [auctionRes, highestRes, bidsRes] = await Promise.all([
        API.get(`/auctions/${id}`),
        API.get(`/bids/auction/${id}/highest`),
        API.get(`/bids/auction/${id}`),
      ]);

      const auctionData = auctionRes.data.auction;
      const highestData = highestRes.data;
      const allBids = bidsRes.data.bids || [];

      setAuction(auctionData);

      if (auctionData.images?.length) {
        setMainImage((prev) => prev || auctionData.images[0]);
      }

      setHighestBid(highestData.highestBid?.bidAmount || 0);
      setMinimumNextBid(highestData.minimumNextBid || 0);
      setIncrement(highestData.increment || 0);
      setBids(allBids);

      const winnerBid =
        allBids.find((bid) => bid.status === "winner") || highestData.highestBid;

      if (winnerBid?.userId?.name) {
        setWinnerName(winnerBid.userId.name);
      } else if (auctionData?.winnerUserId && highestData?.highestBid?.userId?.name) {
        setWinnerName(highestData.highestBid.userId.name);
      }

      const winnerUserId =
        normalizeId(auctionData?.winnerUserId) ||
        normalizeId(highestData?.winnerUserId) ||
        normalizeId(winnerBid?.userId?._id);

      if (
        auctionData?.finalized &&
        currentUserId &&
        winnerUserId &&
        normalizeId(currentUserId) === winnerUserId
      ) {
        const celebrateKey = `winner-celebration-${auctionData._id}-${winnerUserId}`;

        if (!sessionStorage.getItem(celebrateKey)) {
          setShowWinnerCelebration(true);
          sessionStorage.setItem(celebrateKey, "shown");
        }
      }

      setWinnerChecked(true);
    } catch (error) {
      console.error(error);
      toast.error(t.failedToLoadAuction || "Failed to load auction");
    }
  };

  useEffect(() => {
    refreshAuctionData();
  }, [id, language, currentUserId]);

  useEffect(() => {
    if (!auction?.auctionEnd) return;

    const interval = setInterval(async () => {
      const end = new Date(auction.auctionEnd).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(t.auctionEnded || "Auction Ended");
        await refreshAuctionData();
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction, language]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    socket.emit("joinAuction", id);

    socket.on("viewerCount", ({ count }) => {
      setViewerCount(count || 0);
    });

    socket.on("newBid", async (data) => {
      try {
        toast.success(
          `${t.newBidPlaced || "New bid placed"}: ${data.bidAmount} SAR`
        );

        if (data.extended && data.newEnd) {
          setAuction((prev) =>
            prev
              ? {
                  ...prev,
                  auctionEnd: data.newEnd,
                }
              : prev
          );
          toast(t.auctionExtended || "⏱ Auction extended by 30 seconds");
        }

        await refreshAuctionData();
      } catch (error) {
        console.error("Socket refresh error:", error);
      }
    });

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("viewerCount");
      socket.off("newBid");
      socket.disconnect();
    };
  }, [id, language, currentUserId]);

  const isAuctionClosed =
    auction?.finalized ||
    auction?.status === "ended" ||
    auction?.status === "closed" ||
    auction?.status === "sold" ||
    timeLeft === (t.auctionEnded || "Auction Ended");

  const handleBidClick = () => {
    if (!bidAmount) {
      toast.error(t.enterBid || "Enter bid amount");
      return;
    }

    if (isAuctionClosed) {
      toast.error(t.auctionClosed || "Auction already ended");
      return;
    }

    setShowConfirmBid(true);
  };

  const placeBid = async () => {
    if (!bidAmount) {
      toast.error(t.enterBid || "Enter bid amount");
      return;
    }

    if (isAuctionClosed) {
      toast.error(t.auctionClosed || "Auction already ended");
      return;
    }

    try {
      setPlacingBid(true);

      const res = await API.post("/bids", {
        auctionId: auction._id,
        bidAmount: Number(bidAmount),
        note: "",
      });

      toast.success(
        res.data.message ||
          t.bidPlacedSuccessfully ||
          "Bid placed successfully"
      );
      setBidAmount("");

      if (res.data.extended && res.data.auctionEnd) {
        setAuction((prev) =>
          prev
            ? {
                ...prev,
                auctionEnd: res.data.auctionEnd,
              }
            : prev
        );
      }

      await refreshAuctionData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.failedToPlaceBid ||
          "Failed to place bid"
      );
    } finally {
      setPlacingBid(false);
    }
  };

  if (!auction) {
    return <div className="page-container">{t.loading || "Loading..."}</div>;
  }

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="section-title">{getText(auction, "title")}</h2>

        <div className="auction-details-layout">
          <div>
            {mainImage && (
              <img
                src={mainImage}
                alt="main"
                className="auction-main-image"
              />
            )}

            <div className="auction-thumbs">
              {auction.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  onClick={() => setMainImage(img)}
                  className={`auction-thumb ${img === mainImage ? "active" : ""}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p>
              <strong>{t.model || "Model"}:</strong> {getText(auction, "model")}
            </p>
            <p>
              <strong>{t.category || "Category"}:</strong>{" "}
              {getText(auction, "category") || "N/A"}
            </p>
            <p>
              <strong>{t.usageHours || "Usage Hours"}:</strong>{" "}
              {auction.usageHours || 0}
            </p>
            <p>
              <strong>{t.watching || "Watching"}:</strong> {viewerCount}
            </p>
            <p>
              <strong>{t.bids || "Bids"}:</strong>{" "}
              {auction.bidCount || bids.length || 0}
            </p>
            <p>
              <strong>{t.bidders || "Bidders"}:</strong>{" "}
              {auction.bidderCount || 0}
            </p>

            <p style={{ fontSize: "20px", marginTop: "15px" }}>
              <strong>{t.startingPrice || "Starting Price"}:</strong>{" "}
              {auction.startingPrice} SAR
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>{t.status || "Status"}:</strong>{" "}
              {t[auction.status] || auction.status}
            </p>

            {auction.finalized && (
              <div className="winner-box">
                <h3>{t.auctionResult || "Auction Result"}</h3>
                <p>
                  <strong>{t.winningAmount || "Winning Amount"}:</strong>{" "}
                  {auction.winningAmount || highestBid || auction.startingPrice} SAR
                </p>
                <p>
                  <strong>{t.winner || "Winner"}:</strong>{" "}
                  {winnerName ? `🏆 ${winnerName}` : t.winnerSelected || "Winner selected"}
                </p>
              </div>
            )}

            {isAuctionClosed && !auction.finalized && (
              <div className="closed-box">
                {t.auctionClosedMessage ||
                  "This auction is closed. No more bids can be placed."}
              </div>
            )}

            <div className="auction-info-box">
              <strong>{t.timeRemaining || "Time Remaining"}:</strong>
              <div className="auction-timer">{timeLeft}</div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h4>{t.description || "Description"}</h4>
              <p>{getText(auction, "description")}</p>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h4>{t.features || "Features"}</h4>
              <p>{getText(auction, "features") || "-"}</p>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h4>{t.defects || "Defects"}</h4>
              <p>{getText(auction, "defects") || "-"}</p>
            </div>

            <div className="auction-info-box" style={{ marginTop: "25px" }}>
              <h3 style={{ marginBottom: "10px" }}>
                {t.currentHighestBid || "Current Highest Bid"}
              </h3>

              <div className="auction-price-highlight">
                {highestBid || auction.startingPrice} SAR
              </div>

              <p style={{ marginTop: "6px" }}>
                {t.minimumNextBid || "Minimum next bid"}:{" "}
                <strong>{minimumNextBid || auction.startingPrice} SAR</strong>
              </p>

              <p style={{ marginTop: "6px" }}>
                {t.bidIncrement || "Bid increment"}:{" "}
                <strong>{increment || 0} SAR</strong>
              </p>

              <div className="auction-info-box" style={{ marginTop: "20px" }}>
                <h3>{t.recentBids || "Recent Bids"}</h3>

                {bids.length === 0 ? (
                  <p>{t.noBidsYet || "No bids yet"}</p>
                ) : (
                  <div style={{ marginTop: "10px" }}>
                    {bids.map((bid) => (
                      <div key={bid._id} className="bid-history-row">
                        <span className="bid-history-name">
                          {bid.userId?.name || "User"}
                          {bid.status === "winner" ? " 🏆" : ""}
                        </span>
                        <strong className="bid-history-amount">
                          {bid.bidAmount} SAR
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: "14px" }}>
                <input
                  type="number"
                  placeholder={
                    isAuctionClosed
                      ? t.auctionClosed || "Auction closed"
                      : t.enterBid || "Enter your bid"
                  }
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={isAuctionClosed}
                />

                <button
                  className="btn-primary"
                  style={{ marginTop: "10px", width: "100%" }}
                  onClick={handleBidClick}
                  disabled={placingBid || isAuctionClosed}
                >
                  {isAuctionClosed
                    ? t.auctionClosed || "Auction Closed"
                    : placingBid
                    ? t.placingBid || "Placing Bid..."
                    : t.placeBid || "Place Bid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmBid && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>{t.confirmYourBid || "Confirm Your Bid"}</h3>
            <p>
              {t.youAreAboutToBid || "You are about to place a bid of"}{" "}
              <strong>{Number(bidAmount).toLocaleString()} SAR</strong>
            </p>
            <p>
              {t.minimumNextBid || "Minimum next bid"}{" "}
              <strong>{minimumNextBid.toLocaleString()} SAR</strong>
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowConfirmBid(false)}
              >
                {t.cancel || "Cancel"}
              </button>

              <button
                className="btn-primary"
                onClick={async () => {
                  setShowConfirmBid(false);
                  await placeBid();
                }}
              >
                {t.confirmBid || "Confirm Bid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWinnerCelebration && winnerChecked && (
        <div className="modal-overlay">
          <div
            className="confirm-modal"
            style={{
              maxWidth: "560px",
              textAlign: "center",
              overflow: "hidden",
              position: "relative",
              background:
                "linear-gradient(180deg, #fffdf7 0%, #ffffff 45%, #f9fffb 100%)",
              borderTop: "6px solid #E5B867",
            }}
          >
            <div className="winner-confetti">
              <span className="confetti-piece confetti-1"></span>
              <span className="confetti-piece confetti-2"></span>
              <span className="confetti-piece confetti-3"></span>
              <span className="confetti-piece confetti-4"></span>
              <span className="confetti-piece confetti-5"></span>
              <span className="confetti-piece confetti-6"></span>
              <span className="confetti-piece confetti-7"></span>
              <span className="confetti-piece confetti-8"></span>
              <span className="confetti-piece confetti-9"></span>
              <span className="confetti-piece confetti-10"></span>
              <span className="confetti-piece confetti-11"></span>
              <span className="confetti-piece confetti-12"></span>
            </div>

            <div
              style={{
                fontSize: "68px",
                lineHeight: 1,
                marginBottom: "8px",
                animation: "winnerPop 0.9s ease",
              }}
            >
              🏆
            </div>

            <div
              style={{
                display: "inline-block",
                background: "#fff7db",
                color: "#8a6300",
                padding: "8px 16px",
                borderRadius: "999px",
                fontWeight: "800",
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              {isArabic ? "أنت الفائز" : "Winner"}
            </div>

            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                color: "#065f46",
                fontSize: "31px",
              }}
            >
              {isArabic ? "مبروك! لقد فزت بالمزاد" : "Congratulations! You won the auction"}
            </h2>

            <p
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#62564A",
                marginTop: 0,
                marginBottom: "18px",
              }}
            >
              {winnerName ? `🏆 ${winnerName}` : user?.name}
            </p>

            <div
              style={{
                background: "linear-gradient(180deg, #ecfdf5 0%, #f7fff9 100%)",
                border: "1px solid #10b981",
                borderRadius: "18px",
                padding: "18px",
                marginTop: "8px",
                boxShadow: "0 10px 25px rgba(16,185,129,0.08)",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontWeight: "800",
                  color: "#1f2937",
                  fontSize: "18px",
                }}
              >
                {getText(auction, "title")}
              </p>

              <p style={{ margin: "0 0 10px", color: "#374151" }}>
                {isArabic ? "قيمة الفوز" : "Winning Amount"}:{" "}
                <strong>
                  {auction.winningAmount || highestBid || auction.startingPrice} SAR
                </strong>
              </p>

              <p style={{ margin: 0, color: "#374151" }}>
                {isArabic
                  ? "أحسنت! سيتم التواصل معك قريبًا بالخطوات القادمة."
                  : "Well done! Our team will contact you with the next steps soon."}
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                fontSize: "28px",
                letterSpacing: "8px",
                animation: "winnerGlow 1.4s ease-in-out infinite alternate",
              }}
            >
              ✨ 🎉 ✨ 🎊 ✨
            </div>

            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                className="btn-primary"
                onClick={() => setShowWinnerCelebration(false)}
                style={{
                  fontSize: "16px",
                  padding: "12px 18px",
                }}
              >
                {isArabic ? "رائع!" : "Amazing!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionDetails;