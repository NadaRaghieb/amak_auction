import { useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error(t.fillAllFields || "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const res = await API.post(`/auth/reset-password/${token}`, {
        password,
      });

      toast.success(
        res.data.message || t.passwordResetSuccess || "Password reset successful"
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.passwordResetFailed ||
          "Failed to reset password"
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
          <h2>{t.resetPasswordTitle || "Reset Password"}</h2>
          <p className="auth-subtitle">
            {t.resetPasswordSubtitle || "Enter your new password below."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{t.newPassword || "New Password"}</label>
            <input
              type="password"
              placeholder={t.newPassword || "New Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>{t.confirmNewPassword || "Confirm New Password"}</label>
            <input
              type="password"
              placeholder={t.confirmNewPassword || "Confirm New Password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? t.resettingPassword || "Resetting..."
              : t.resetPasswordButton || "Reset Password"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            {t.backToLogin || "Back to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;