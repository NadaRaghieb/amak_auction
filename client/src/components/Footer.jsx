import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import logo from "../assets/amak-logo.jpeg";

function Footer() {
  const { user } = useAuth();
  const { language, isArabic } = useLanguage();
  const t = translations[language];

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Column 1 - Brand */}
        <div className="footer-col">
          <div className="footer-brand">
            <img src={logo} alt="AMAK" />
            <div>
              <h3>AMAK Equipment Auction</h3>
              <p>
                {isArabic
                  ? "منصة مزاد المعدات الخاصة بشركة أماك"
                  : "AMAK equipment auction platform"}
              </p>
            </div>
          </div>
        </div>

        {/* Column 2 - Links */}
        <div className="footer-col">
          <h4>{isArabic ? "روابط سريعة" : "Quick Links"}</h4>
          <div className="footer-links">
            <Link to="/">{t.navAuctions}</Link>
            {!user && <Link to="/login">{t.navLogin}</Link>}
            {!user && <Link to="/register">{t.navRegister}</Link>}
            {user && <Link to="/my-bids">{t.navMyBids}</Link>}
          </div>
        </div>

        {/* Column 3 - Contact */}
        <div className="footer-col">
          <h4>{isArabic ? "تواصل معنا" : "Contact"}</h4>
          <div className="footer-contact">
            <p>Email: info@amak.com</p>
            <p>Phone: +966 5XXXXXXXX</p>
            <p>Saudi Arabia</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} AMAK.{" "}
        {isArabic ? "جميع الحقوق محفوظة" : "All rights reserved."}
      </div>
    </footer>
  );
}

export default Footer;