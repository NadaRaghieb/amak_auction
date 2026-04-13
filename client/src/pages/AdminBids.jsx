import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function AdminBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const { language, isArabic } = useLanguage();
  const t = translations[language];

  const getAuctionTitle = (auction) => {
    if (!auction) return t.unknown || "Unknown";
    return isArabic
      ? auction.title_ar || auction.title_en || t.unknown || "Unknown"
      : auction.title_en || auction.title_ar || t.unknown || "Unknown";
  };

  const getIdentityTypeLabel = (type) => {
    if (!type) return "-";
    if (type === "national_id") {
      return isArabic ? "هوية وطنية" : "National ID";
    }
    if (type === "iqama") {
      return isArabic ? "إقامة" : "Iqama";
    }
    return type;
  };

  const fetchBids = async () => {
    try {
      const res = await API.get("/bids");
      setBids(res.data.bids || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToLoadBids ||
          "Failed to load bids"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [language]);

  const highestByAuction = useMemo(() => {
    const map = {};

    for (const bid of bids) {
      const auctionId = bid.auctionId?._id;
      if (!auctionId) continue;

      if (!map[auctionId] || bid.bidAmount > map[auctionId].bidAmount) {
        map[auctionId] = bid;
      }
    }

    return map;
  }, [bids]);

  const handleReview = async (bidId, status) => {
    try {
      await API.put(`/bids/${bidId}/review`, { status });
      toast.success(`${t.bidMarkedAs || "Bid marked as"} ${t[status] || status}`);
      fetchBids();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToUpdateBid ||
          "Failed to update bid"
      );
    }
  };

  const handleWinner = async (bidId) => {
    try {
      await API.put(`/bids/${bidId}/winner`);
      toast.success(
        t.winnerSelectedSuccessfully || "Winner selected successfully"
      );
      fetchBids();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToSelectWinner ||
          "Failed to select winner"
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingBids || "Loading bids..."}
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="section-title">{t.manageBids || "Manage Bids"}</h2>

      {bids.length === 0 ? (
        <div className="card empty-state">
          {t.noBidsFound || "No bids found."}
        </div>
      ) : (
        <div className="grid">
          {bids.map((bid) => {
            const auctionId = bid.auctionId?._id;
            const isHighest = highestByAuction[auctionId]?._id === bid._id;
            const auctionClosed =
              bid.auctionId?.status === "ended" ||
              bid.auctionId?.status === "closed" ||
              bid.auctionId?.status === "sold";

            return (
              <div key={bid._id} className="card admin-card">
                <p>
                  <strong>{t.bidder || "Bidder"}:</strong> {bid.userId?.name} (
                  {bid.userId?.email})
                </p>

                <p>
                  <strong>{t.phone || "Phone"}:</strong> {bid.userId?.phone || "-"}
                </p>

                <p>
                  <strong>{isArabic ? "نوع الهوية" : "Identity Type"}:</strong>{" "}
                  {getIdentityTypeLabel(bid.userId?.identityType)}
                </p>

                <p>
                  <strong>{isArabic ? "رقم الهوية" : "Identity Number"}:</strong>{" "}
                  {bid.userId?.identityNumber || "-"}
                </p>

                <p>
                  <strong>{t.auction || "Auction"}:</strong>{" "}
                  {getAuctionTitle(bid.auctionId)}
                </p>

                <p>
                  <strong>{t.amount || "Amount"}:</strong> {bid.bidAmount} SAR
                </p>

                <p>
                  <strong>{t.status || "Status"}:</strong>{" "}
                  {t[bid.status] || bid.status}
                </p>

                <p>
                  <strong>{t.note || "Note"}:</strong> {bid.note || "-"}
                </p>

                <p>
                  <strong>{t.date || "Date"}:</strong>{" "}
                  {new Date(bid.createdAt).toLocaleString()}
                </p>

                <div className="admin-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleReview(bid._id, "accepted")}
                  >
                    {t.accept || "Accept"}
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleReview(bid._id, "rejected")}
                  >
                    {t.reject || "Reject"}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => handleReview(bid._id, "reviewed")}
                  >
                    {t.reviewed || "Reviewed"}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => handleReview(bid._id, "contacted")}
                  >
                    {t.contacted || "Contacted"}
                  </button>

                  {isHighest && bid.status !== "winner" && !auctionClosed && (
                    <button
                      className="btn-primary"
                      onClick={() => handleWinner(bid._id)}
                    >
                      {t.markWinner || "Mark Winner"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBids;