import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/amak-logo.jpeg";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [now, setNow] = useState(Date.now());

  const { language, isArabic } = useLanguage();
  const t = translations[language];

  const getText = (auction, key) => {
    if (isArabic) {
      return auction?.[`${key}_ar`] || auction?.[`${key}_en`] || "";
    }
    return auction?.[`${key}_en`] || auction?.[`${key}_ar`] || "";
  };

  const fetchAuctions = async (showError = true) => {
    try {
      const res = await API.get("/auctions");
      setAuctions(res.data.auctions || []);
    } catch (error) {
      console.error(error);
      if (showError) {
        toast.error(t.failedToLoadAuctions || "Failed to load auctions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchAuctions(false);
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "live":
        return "status-badge live";
      case "upcoming":
        return "status-badge upcoming";
      case "ended":
        return "status-badge ended";
      case "sold":
        return "status-badge sold";
      default:
        return "status-badge";
    }
  };

  const categories = useMemo(() => {
    const values = auctions
      .map((auction) => getText(auction, "category"))
      .filter(Boolean);

    return ["all", ...new Set(values)];
  }, [auctions, isArabic]);

  const getCountdownText = (auction) => {
    if (!auction?.auctionEnd) return t.noEndDate || "No end date";

    const end = new Date(auction.auctionEnd).getTime();
    const diff = end - now;

    if (auction.status === "sold") return t.sold || "Sold";
    if (auction.status === "ended" || auction.finalized || diff <= 0) {
      return t.auctionEnded || "Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const getViewerCount = (auction) => {
    const bidCount = auction.bidCount || 0;
    const bidderCount = auction.bidderCount || 0;
    return Math.max(bidderCount, bidCount, 1);
  };

  const filteredAuctions = useMemo(() => {
    const filtered = auctions.filter((auction) => {
      const title = getText(auction, "title").toLowerCase();
      const model = getText(auction, "model").toLowerCase();
      const category = getText(auction, "category").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        model.includes(search) ||
        category.includes(search);

      const matchesStatus =
        (activeTab === "all" || auction.status === activeTab) &&
        (selectedStatus === "all" || auction.status === selectedStatus);

      const currentCategory = getText(auction, "category");
      const matchesCategory =
        selectedCategory === "all" || currentCategory === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
        break;
      case "ending-soon":
        sorted.sort(
          (a, b) =>
            new Date(a.auctionEnd).getTime() - new Date(b.auctionEnd).getTime()
        );
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return sorted;
  }, [
    auctions,
    searchTerm,
    selectedStatus,
    selectedCategory,
    sortBy,
    activeTab,
    isArabic,
  ]);

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingAuctions || "Loading auctions..."}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="hero">
        <div className="hero-inner">
          <img src={logo} alt="AMAK" className="hero-logo" />
        </div>
      </div>

      <div className="section-header">
        <div>
          <p className="eyebrow">AMAK Equipment Auction</p>
          <h2 className="section-title">{t.availableAuctions}</h2>
          <p className="section-subtitle">{t.browseAuctions}</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "all" ? "tab active" : "tab"}
          onClick={() => setActiveTab("all")}
        >
          {t.all}
        </button>
        <button
          className={activeTab === "live" ? "tab active" : "tab"}
          onClick={() => setActiveTab("live")}
        >
          {t.live}
        </button>
        <button
          className={activeTab === "upcoming" ? "tab active" : "tab"}
          onClick={() => setActiveTab("upcoming")}
        >
          {t.upcoming}
        </button>
        <button
          className={activeTab === "ended" ? "tab active" : "tab"}
          onClick={() => setActiveTab("ended")}
        >
          {t.ended}
        </button>
        <button
          className={activeTab === "sold" ? "tab active" : "tab"}
          onClick={() => setActiveTab("sold")}
        >
          {t.sold}
        </button>
      </div>

      <div className="card filter-bar">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">{t.allStatuses}</option>
          <option value="live">{t.live}</option>
          <option value="upcoming">{t.upcoming}</option>
          <option value="ended">{t.ended}</option>
          <option value="sold">{t.sold}</option>
          <option value="draft">{t.draft}</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? t.allCategories : category}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">{t.newest}</option>
          <option value="price-low">{t.priceLow}</option>
          <option value="price-high">{t.priceHigh}</option>
          <option value="ending-soon">{t.endingSoon}</option>
        </select>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="card empty-state">
          <p>{t.noAuctions}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredAuctions.map((auction) => (
            <div key={auction._id} className="card auction-card">
              <div className="auction-image-wrapper">
                {auction.images?.[0] ? (
                  <img
                    src={auction.images[0]}
                    alt={getText(auction, "title")}
                    className="auction-image"
                  />
                ) : (
                  <div className="auction-image placeholder-image">
                    {t.noImage}
                  </div>
                )}

                <span className={getStatusClass(auction.status)}>
                  {t[auction.status] || auction.status}
                </span>

                {auction.status === "live" && (
                  <span className="live-floating-badge">{t.live}</span>
                )}
              </div>

              <div className="auction-card-body">
                <h3 className="auction-title">{getText(auction, "title")}</h3>
                <p className="auction-model">{getText(auction, "model")}</p>

                <div className="auction-meta">
                  <p>
                    <strong>{t.currentPrice}:</strong>{" "}
                    {auction.currentPrice || auction.startingPrice} SAR
                  </p>
                  <p>
                    <strong>{t.startingPrice}:</strong> {auction.startingPrice}{" "}
                    SAR
                  </p>
                  <p>
                    <strong>{t.category}:</strong>{" "}
                    {getText(auction, "category") || "N/A"}
                  </p>
                  <p>
                    <strong>{t.usageHours}:</strong> {auction.usageHours || 0}
                  </p>
                  <p>
                    <strong>{t.bids}:</strong> {auction.bidCount || 0}
                  </p>
                  <p>
                    <strong>{t.bidders}:</strong> {auction.bidderCount || 0}
                  </p>

                  {auction.finalized && auction.winningAmount && (
                    <p>
                      <strong>{t.finalPrice}:</strong> {auction.winningAmount}{" "}
                      SAR
                    </p>
                  )}
                </div>

                <div className="auction-card-stats">
                  <div className="auction-countdown">
                    <span className="mini-label">{t.endsIn}</span>
                    <strong>{getCountdownText(auction)}</strong>
                  </div>

                  <div className="auction-viewers">
                    <span className="mini-label">{t.watching}</span>
                    <strong>{getViewerCount(auction)}</strong>
                  </div>
                </div>

                <Link
                  to={`/auctions/${auction._id}`}
                  className="btn-primary auction-btn"
                  style={{ display: "inline-block" }}
                >
                  {t.viewDetails}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Auctions;