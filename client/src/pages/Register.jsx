import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function Register() {
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    identityType: "",
    identityNumber: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const requiredLabel = (label) => (
    <span>
      {label} <span style={{ color: "red" }}>*</span>
    </span>
  );

  const identityTypeLabel = isArabic ? "نوع الهوية" : "Identity Type";
  const nationalIdLabel = isArabic ? "هوية وطنية" : "National ID";
  const iqamaLabel = isArabic ? "إقامة" : "Iqama";
  const identityNumberLabel = isArabic ? "رقم الهوية / الإقامة" : "Identity / Iqama Number";

  const identityNumberPlaceholder =
    formData.identityType === "national_id"
      ? isArabic
        ? "أدخل رقم الهوية الوطنية"
        : "Enter national ID number"
      : formData.identityType === "iqama"
      ? isArabic
        ? "أدخل رقم الإقامة"
        : "Enter iqama number"
      : isArabic
      ? "اختر نوع الهوية أولاً"
      : "Select identity type first";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await API.post("/auth/register", formData);

      toast.success(t.registerSuccess || "Account created successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.registerFailed ||
          "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">AMAK Equipment Auction</p>
          <h2>{t.registerTitle || "Register"}</h2>
          <p className="auth-subtitle">
            {t.registerSubtitle || "Create your account to start bidding."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{requiredLabel(t.name || "Name")}</label>
            <input
              name="name"
              placeholder={t.name || "Name"}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>{requiredLabel(t.email || "Email")}</label>
            <input
              type="email"
              name="email"
              placeholder={t.email || "Email"}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>{requiredLabel(t.phone || "Phone Number")}</label>
            <input
              name="phone"
              placeholder={t.phone || "Phone Number"}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>{requiredLabel(identityTypeLabel)}</label>
            <select
              name="identityType"
              value={formData.identityType}
              onChange={handleChange}
              required
            >
              <option value="">
                {isArabic ? "اختر نوع الهوية" : "Select identity type"}
              </option>
              <option value="national_id">{nationalIdLabel}</option>
              <option value="iqama">{iqamaLabel}</option>
            </select>
          </div>

          <div className="auth-field">
            <label>{requiredLabel(identityNumberLabel)}</label>
            <input
              name="identityNumber"
              placeholder={identityNumberPlaceholder}
              value={formData.identityNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>{requiredLabel(t.password || "Password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t.password || "Password"}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? t.creatingAccount || "Creating..."
              : t.createAccount || "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t.haveAccount || "Already have an account?"}</span>
          <Link to="/login" className="auth-link">
            {t.navLogin || "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;