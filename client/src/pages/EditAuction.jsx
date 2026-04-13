import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    model_en: "",
    model_ar: "",
    description_en: "",
    description_ar: "",
    features_en: "",
    features_ar: "",
    defects_en: "",
    defects_ar: "",
    category_en: "",
    category_ar: "",
    serialNumber: "",
    usageHours: "",
    startingPrice: "",
    images: "",
    status: "draft",
    auctionStart: "",
    auctionEnd: "",
  });

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await API.get(`/auctions/${id}`);
        const auction = res.data.auction;

        setFormData({
          title_en: auction.title_en || "",
          title_ar: auction.title_ar || "",
          model_en: auction.model_en || "",
          model_ar: auction.model_ar || "",
          description_en: auction.description_en || "",
          description_ar: auction.description_ar || "",
          features_en: auction.features_en || "",
          features_ar: auction.features_ar || "",
          defects_en: auction.defects_en || "",
          defects_ar: auction.defects_ar || "",
          category_en: auction.category_en || "",
          category_ar: auction.category_ar || "",
          serialNumber: auction.serialNumber || "",
          usageHours: auction.usageHours || "",
          startingPrice: auction.startingPrice || "",
          images: auction.images?.join(", ") || "",
          status: auction.status || "draft",
          auctionStart: auction.auctionStart
            ? new Date(auction.auctionStart).toISOString().slice(0, 16)
            : "",
          auctionEnd: auction.auctionEnd
            ? new Date(auction.auctionEnd).toISOString().slice(0, 16)
            : "",
        });
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            t.failedToLoadAuction ||
            "Failed to load auction"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id, language]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        usageHours: Number(formData.usageHours || 0),
        startingPrice: Number(formData.startingPrice),
        images: formData.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img !== ""),
      };

      await API.put(`/auctions/${id}`, payload);

      toast.success(t.auctionUpdatedSuccessfully || "Auction updated successfully");
      navigate("/admin/auctions");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t.failedToUpdateAuction ||
          "Failed to update auction"
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        {t.loadingAuction || "Loading auction..."}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="section-title">{t.editAuctionTitle}</h2>

        <form onSubmit={handleSubmit} className="auction-form-grid">
          <input
            name="title_en"
            placeholder={t.titleEn}
            value={formData.title_en}
            onChange={handleChange}
          />
          <input
            name="title_ar"
            placeholder={t.titleAr}
            value={formData.title_ar}
            onChange={handleChange}
          />

          <input
            name="model_en"
            placeholder={t.modelEn}
            value={formData.model_en}
            onChange={handleChange}
          />
          <input
            name="model_ar"
            placeholder={t.modelAr}
            value={formData.model_ar}
            onChange={handleChange}
          />

          <textarea
            name="description_en"
            placeholder={t.descriptionEn}
            value={formData.description_en}
            onChange={handleChange}
          />
          <textarea
            name="description_ar"
            placeholder={t.descriptionAr}
            value={formData.description_ar}
            onChange={handleChange}
          />

          <textarea
            name="features_en"
            placeholder={t.featuresEn}
            value={formData.features_en}
            onChange={handleChange}
          />
          <textarea
            name="features_ar"
            placeholder={t.featuresAr}
            value={formData.features_ar}
            onChange={handleChange}
          />

          <textarea
            name="defects_en"
            placeholder={t.defectsEn}
            value={formData.defects_en}
            onChange={handleChange}
          />
          <textarea
            name="defects_ar"
            placeholder={t.defectsAr}
            value={formData.defects_ar}
            onChange={handleChange}
          />

          <input
            name="category_en"
            placeholder={t.categoryEn}
            value={formData.category_en}
            onChange={handleChange}
          />
          <input
            name="category_ar"
            placeholder={t.categoryAr}
            value={formData.category_ar}
            onChange={handleChange}
          />

          <input
            name="serialNumber"
            placeholder={t.serialNumber}
            value={formData.serialNumber}
            onChange={handleChange}
          />
          <input
            name="usageHours"
            type="number"
            placeholder={t.usageHours}
            value={formData.usageHours}
            onChange={handleChange}
          />

          <input
            name="startingPrice"
            type="number"
            placeholder={t.startingPrice}
            value={formData.startingPrice}
            onChange={handleChange}
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">{t.draft}</option>
            <option value="upcoming">{t.upcoming}</option>
            <option value="live">{t.live}</option>
            <option value="ended">{t.ended}</option>
            <option value="closed">{t.closed}</option>
            <option value="sold">{t.sold}</option>
          </select>

          <input
            name="auctionStart"
            type="datetime-local"
            value={formData.auctionStart}
            onChange={handleChange}
          />

          <input
            name="auctionEnd"
            type="datetime-local"
            value={formData.auctionEnd}
            onChange={handleChange}
          />

          <textarea
            name="images"
            placeholder={t.imageUrlsCommaSeparated}
            value={formData.images}
            onChange={handleChange}
            className="form-span-full"
            rows={4}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "220px" }}
          >
            {t.updateAuction}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditAuction;