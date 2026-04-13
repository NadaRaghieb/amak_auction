import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { language, isArabic } = useLanguage();
  const t = translations[language];

  const getText = (auction, key) => {
    if (!auction) return "";
    return isArabic
      ? auction[`${key}_ar`] || auction[`${key}_en`] || ""
      : auction[`${key}_en`] || auction[`${key}_ar`] || "";
  };

  const fetchAuctions = async () => {
    try {
      const res = await API.get("/auctions");
      setAuctions(res.data.auctions || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToLoadAuctions ||
          "Failed to load auctions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [language]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      t.confirmDeleteAuction || "Are you sure you want to delete this auction?"
    );
    if (!confirmed) return;

    try {
      await API.delete(`/auctions/${id}`);
      toast.success(t.auctionDeletedSuccessfully || "Auction deleted successfully");
      fetchAuctions();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToDeleteAuction ||
          "Failed to delete auction"
      );
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/auctions/${id}/status`, { status });
      toast.success(t.auctionStatusUpdated || "Auction status updated");
      fetchAuctions();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToUpdateStatus ||
          "Failed to update status"
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingAdminAuctions || "Loading admin auctions..."}
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="section-title">{t.manageAuctions || "Manage Auctions"}</h2>

      {auctions.length === 0 ? (
        <div className="card empty-state">
          {t.noAuctionsFound || "No auctions found."}
        </div>
      ) : (
        <div className="grid">
          {auctions.map((auction) => (
            <div key={auction._id} className="card admin-card">
              <p>
                <strong>{t.title || "Title"}:</strong> {getText(auction, "title")}
              </p>
              <p>
                <strong>{t.model || "Model"}:</strong> {getText(auction, "model")}
              </p>
              <p>
                <strong>{t.startingPrice || "Starting Price"}:</strong>{" "}
                {auction.startingPrice} SAR
              </p>
              <p>
                <strong>{t.status || "Status"}:</strong>{" "}
                {t[auction.status] || auction.status}
              </p>

              <div className="admin-actions">
                <Link to={`/admin/auctions/${auction._id}/edit`}>
                  <button className="btn-secondary">
                    {t.edit || "Edit"}
                  </button>
                </Link>

                <button
                  className="btn-primary"
                  onClick={() => handleStatusChange(auction._id, "live")}
                >
                  {t.setLive || "Set Live"}
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange(auction._id, "ended")}
                >
                  {t.setEnded || "Set Ended"}
                </button>

                <button
                  className="btn-primary"
                  onClick={() => handleStatusChange(auction._id, "sold")}
                >
                  {t.setSold || "Set Sold"}
                </button>

                <button
                  className="btn-danger"
                  onClick={() => handleDelete(auction._id)}
                >
                  {t.delete || "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAuctions;