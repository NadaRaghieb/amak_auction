import { useEffect, useState } from "react";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const { language, isArabic } = useLanguage();
  const t = translations[language];

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

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMsg(t.loginFirst || "Please login as admin first");
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/admin/dashboard");
        setDashboard(res.data);
      } catch (error) {
        console.error(error);
        setErrorMsg(
          error.response?.data?.message ||
            t.failedToLoadDashboard ||
            "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [language]);

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingDashboard || "Loading admin dashboard..."}
      </div>
    );
  }

  if (errorMsg) {
    return <div className="page-container">{errorMsg}</div>;
  }

  if (!dashboard) {
    return (
      <div className="page-container">
        {t.noDashboardData || "No dashboard data found."}
      </div>
    );
  }

  const { stats, recentBids } = dashboard;

  return (
    <div className="page-container">
      <h2 className="section-title">
        {t.adminDashboard || "Admin Dashboard"}
      </h2>

      {/* Stats */}
      <div className="grid grid-4">
        <div className="card stat-card">
          <h4>{t.totalUsers || "Total Users"}</h4>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="card stat-card">
          <h4>{t.totalAuctions || "Total Auctions"}</h4>
          <p>{stats.totalAuctions}</p>
        </div>

        <div className="card stat-card">
          <h4>{t.totalBids || "Total Bids"}</h4>
          <p>{stats.totalBids}</p>
        </div>

        <div className="card stat-card">
          <h4>{t.liveAuctions || "Live Auctions"}</h4>
          <p>{stats.liveAuctions}</p>
        </div>

        <div className="card stat-card">
          <h4>{t.endedAuctions || "Ended Auctions"}</h4>
          <p>{stats.endedAuctions}</p>
        </div>
      </div>

      {/* Recent Bids */}
      <div style={{ marginTop: "28px" }}>
        <h3 className="section-title">
          {t.recentBids || "Recent Bids"}
        </h3>

        {recentBids.length === 0 ? (
          <div className="card empty-state">
            {t.noBidsYet || "No bids yet."}
          </div>
        ) : (
          <div className="grid">
            {recentBids.map((bid) => (
              <div key={bid._id} className="card admin-card">
                <p>
                  <strong>{t.bidder || "Bidder"}:</strong>{" "}
                  {bid.userId?.name} ({bid.userId?.email})
                </p>

                <p>
                  <strong>{t.phone || "Phone"}:</strong>{" "}
                  {bid.userId?.phone || "-"}
                </p>

                {/* 🔥 الجديد */}
                <p>
                  <strong>
                    {isArabic ? "نوع الهوية" : "Identity Type"}:
                  </strong>{" "}
                  {getIdentityTypeLabel(bid.userId?.identityType)}
                </p>

                <p>
                  <strong>
                    {isArabic ? "رقم الهوية" : "Identity Number"}:
                  </strong>{" "}
                  {bid.userId?.identityNumber || "-"}
                </p>

                <p>
                  <strong>{t.auction || "Auction"}:</strong>{" "}
                  {bid.auctionId?.title_en || "Unknown"}
                </p>

                <p>
                  <strong>{t.amount || "Amount"}:</strong>{" "}
                  {bid.bidAmount} SAR
                </p>

                <p>
                  <strong>{t.status || "Status"}:</strong>{" "}
                  {t[bid.status] || bid.status}
                </p>

                <p>
                  <strong>{t.date || "Date"}:</strong>{" "}
                  {new Date(bid.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;