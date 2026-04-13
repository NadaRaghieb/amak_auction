import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const { language, isArabic } = useLanguage();
  const t = translations[language];

  const getAuctionTitle = (auction) => {
    if (!auction) return t.unknownAuction || "Unknown Auction";
    return isArabic
      ? auction.title_ar || auction.title_en || t.unknownAuction || "Unknown Auction"
      : auction.title_en || auction.title_ar || t.unknownAuction || "Unknown Auction";
  };

  useEffect(() => {
    const fetchMyBids = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(t.pleaseLoginFirst || "Please login first");
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/bids/my");
        setBids(res.data.bids || []);
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            t.failedToLoadYourBids ||
            "Failed to load your bids"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, [language]);

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingYourBids || "Loading your bids..."}
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="section-title">{t.myBids || "My Bids"}</h2>

      {bids.length === 0 ? (
        <div className="card empty-state">
          {t.noMyBids || "You have not placed any bids yet."}
        </div>
      ) : (
        <div className="grid">
          {bids.map((bid) => (
            <div key={bid._id} className="card admin-card">
              <p>
                <strong>{t.auction || "Auction"}:</strong>{" "}
                {getAuctionTitle(bid.auctionId)}
              </p>

              <p>
                <strong>{t.bidAmount || "Bid Amount"}:</strong> {bid.bidAmount} SAR
              </p>

              <p>
                <strong>{t.status || "Status"}:</strong>{" "}
                <span
                  className={`result-badge ${
                    bid.status === "winner"
                      ? "winner"
                      : bid.status === "lost"
                      ? "lost"
                      : "pending"
                  }`}
                >
                  {t[bid.status] || bid.status}
                </span>
              </p>

              {bid.status === "winner" && (
                <p>
                  <strong>{t.result || "Result"}:</strong>{" "}
                  {t.youWon || "You won this auction 🏆"}
                </p>
              )}

              {bid.auctionId?.winningAmount && (
                <p>
                  <strong>{t.winningAmount || "Winning Amount"}:</strong>{" "}
                  {bid.auctionId.winningAmount} SAR
                </p>
              )}

              <p>
                <strong>{t.note || "Note"}:</strong> {bid.note || "-"}
              </p>

              <p>
                <strong>{t.placedAt || "Placed At"}:</strong>{" "}
                {new Date(bid.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBids;