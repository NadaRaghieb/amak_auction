import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

function Login() {
  const navigate = useNavigate();
  const { fetchMe } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      await fetchMe();

      toast.success(t.loginSuccess || "Login successful");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || t.loginFailed || "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error(t.enterEmailFirst || "Enter your email first");
      return;
    }

    try {
      setSendingReset(true);
      const res = await API.post("/auth/forgot-password", {
        email: forgotEmail,
      });

      toast.success(
        res.data.message || t.passwordResetEmailSent || "Password reset email sent"
      );
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.failedToSendResetEmail ||
          "Failed to send reset email"
      );
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">AMAK Equipment Auction</p>
          <h2>{t.loginTitle || "Login"}</h2>
          <p className="auth-subtitle">
            {t.loginSubtitle || "Sign in to continue to your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{t.email || "Email"}</label>
            <input
              type="email"
              placeholder={t.email || "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>{t.password || "Password"}</label>
            <input
              type="password"
              placeholder={t.password || "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? t.signingIn || "Signing in..."
              : t.navLogin || "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t.noAccount || "Don’t have an account?"}</span>
          <Link to="/register" className="auth-link">
            {t.navRegister || "Register"}
          </Link>
        </div>

        <div className="auth-footer" style={{ marginTop: "10px" }}>
          <button
            type="button"
            className="link-button"
            onClick={() => setShowForgotPassword(true)}
          >
            {t.forgotPassword || "Forgot Password?"}
          </button>
        </div>
      </div>

      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>{t.forgotPassword || "Forgot Password?"}</h3>
            <p>{t.enterYourEmailToReset || "Enter your email to receive a reset link."}</p>

            <input
              type="email"
              placeholder={t.email || "Email"}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowForgotPassword(false)}
              >
                {t.cancel || "Cancel"}
              </button>

              <button
                className="btn-primary"
                onClick={handleForgotPassword}
                disabled={sendingReset}
              >
                {sendingReset
                  ? t.sending || "Sending..."
                  : t.sendResetLink || "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;