import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import MyBids from "./pages/MyBids";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAuctions from "./pages/AdminAuctions";
import AddAuction from "./pages/AddAuction";
import EditAuction from "./pages/EditAuction";
import AdminBids from "./pages/AdminBids";

import { useAuth } from "./context/useAuth";
import { useLanguage } from "./context/LanguageContext";
import translations from "./i18n/translations";
import API from "./api/axios";
import logo from "./assets/amak-logo.jpeg";
import Footer from "./components/Footer";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="page-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="page-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function Navigation() {
  const { user, logout, authLoading, fetchMe } = useAuth();
  const navigate = useNavigate();
  const { language, toggleLanguage, isArabic } = useLanguage();
  const t = translations[language];

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openProfileModal = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
    });
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async () => {
    try {
      setProfileSubmitting(true);
      const res = await API.put("/auth/profile", profileForm);
      toast.success(
        res.data.message || t.profileUpdatedSuccessfully || "Profile updated successfully"
      );
      await fetchMe();
      setShowProfileModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.failedToUpdateProfile ||
          "Failed to update profile"
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordSubmitting(true);
      const res = await API.put("/auth/change-password", passwordForm);
      toast.success(
        res.data.message || t.passwordChangedSuccessfully || "Password changed successfully"
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t.failedToChangePassword ||
          "Failed to change password"
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="navbar">Loading...</div>;
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-brand">
            <img src={logo} alt="AMAK" className="nav-logo" />
          </Link>

          <div className="nav-links">
            <Link to="/">{t.navAuctions}</Link>

            {!user && <Link to="/login">{t.navLogin}</Link>}
            {!user && <Link to="/register">{t.navRegister}</Link>}

            {user && <Link to="/my-bids">{t.navMyBids}</Link>}

            {user?.role === "admin" && <Link to="/admin">{t.navDashboard}</Link>}
            {user?.role === "admin" && (
              <Link to="/admin/auctions">{t.navManageAuctions}</Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin/bids">{t.navManageBids}</Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin/auctions/new">{t.navAddBid}</Link>
            )}

            {user && (
              <button className="btn-secondary" onClick={openProfileModal}>
                {t.editProfile || "Edit Profile"}
              </button>
            )}

            {user && (
              <button className="btn-secondary" onClick={handleLogout}>
                {t.navLogout}
              </button>
            )}

            <button onClick={toggleLanguage} className="btn-secondary">
              {isArabic ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="confirm-modal profile-modal">
            <h3>{t.editProfile || "Edit Profile"}</h3>

            <div className="auth-form">
              <div className="auth-field">
                <label>{t.name || "Name"}</label>
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="auth-field">
                <label>{t.email || "Email"}</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="auth-field">
                <label>{t.phone || "Phone"}</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleProfileUpdate}
                disabled={profileSubmitting}
              >
                {profileSubmitting
                  ? t.saving || "Saving..."
                  : t.saveChanges || "Save Changes"}
              </button>
            </div>

            <hr className="profile-divider" />

            <h3>{t.changePassword || "Change Password"}</h3>

            <div className="auth-form">
              <div className="auth-field">
                <label>{t.currentPassword || "Current Password"}</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="auth-field">
                <label>{t.newPassword || "New Password"}</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                className="btn-primary"
                onClick={handlePasswordChange}
                disabled={passwordSubmitting}
              >
                {passwordSubmitting
                  ? t.saving || "Saving..."
                  : t.changePassword || "Change Password"}
              </button>
            </div>

            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button
                className="btn-secondary"
                onClick={() => setShowProfileModal(false)}
              >
                {t.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#62564A",
            border: "1px solid #E5B867",
            borderRadius: "12px",
            padding: "12px 16px",
            fontWeight: "600",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          },
        }}
      />

      <Navigation />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Auctions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auctions/:id" element={<AuctionDetails />} />

          <Route
            path="/my-bids"
            element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions"
            element={
              <AdminRoute>
                <AdminAuctions />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions/new"
            element={
              <AdminRoute>
                <AddAuction />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions/:id/edit"
            element={
              <AdminRoute>
                <EditAuction />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/bids"
            element={
              <AdminRoute>
                <AdminBids />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;