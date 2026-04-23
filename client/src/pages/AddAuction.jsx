import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function AddAuction() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

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
    status: "draft",
    auctionStart: "",
    auctionEnd: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = "dyqvvyors";
  const UPLOAD_PRESET = "amak_unsigned_upload";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );

    setPreviewUrls((prev) => {
      const urlToRemove = prev[indexToRemove];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];

    const compressionOptions = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.8,
    };

    for (const file of selectedFiles) {
      let processedFile = file;

      try {
        processedFile = await imageCompression(file, compressionOptions);
      } catch (compressionError) {
        console.error("Compression error:", compressionError);
      }

      const data = new FormData();
      data.append("file", processedFile);
      data.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Image upload failed");
      }

      uploadedUrls.push(result.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      let uploadedImages = [];

      if (selectedFiles.length > 0) {
        uploadedImages = await uploadImagesToCloudinary();
      }

      const payload = {
        ...formData,
        usageHours: Number(formData.usageHours || 0),
        startingPrice: Number(formData.startingPrice),
        images: uploadedImages,
      };

      await API.post("/auctions", payload);

      toast.success(t.auctionCreatedSuccessfully || "Auction created successfully");

      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      navigate("/admin/auctions");
    } catch (error) {
      console.error(error);
      toast.error(
        error.message ||
          error.response?.data?.message ||
          t.failedToCreateAuction ||
          "Failed to create auction"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="section-title">{t.addAuctionTitle}</h2>

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
          <h4>Start Date</h4>
          <input
            name="auctionStart"
            type="datetime-local"
            value={formData.auctionStart}
            onChange={handleChange}
          />
          <h4>End Date</h4>
          <input
            name="auctionEnd"
            type="datetime-local"
            value={formData.auctionEnd}
            onChange={handleChange}
          />

          <div className="form-span-full">
            <label className="form-label">{t.uploadImages}</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 && (
              <div className="upload-preview-block">
                <p className="upload-preview-count">
                  {selectedFiles.length} {t.imagesSelected}
                </p>

                <div className="upload-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="card upload-preview-card">
                      <div className="upload-preview-image-wrap">
                        <img
                          src={url}
                          alt={`preview-${index}`}
                          className="upload-preview-image"
                        />
                      </div>

                      <p className="upload-file-name">
                        {selectedFiles[index]?.name}
                      </p>

                      <p className="upload-file-size">
                        {(
                          selectedFiles[index]?.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleRemoveImage(index)}
                        style={{ width: "100%" }}
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "220px" }}
            disabled={uploading}
          >
            {uploading ? t.uploading : t.createAuction}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAuction;