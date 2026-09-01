# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.











#AdminController

// --- LOGIN CONTROLLER (reCAPTCHA v2 only) ---
const adminLogin = async (req, res) => {
  const { email, password, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ success: false, message: "Missing CAPTCHA token." });
    }

    try {
      const decoded = jwt.verify(captchaToken, process.env.CAPTCHA_SECRET);
      if (!decoded.passed) {
        return res.status(403).json({ success: false, message: "Invalid CAPTCHA token." });
      }
    } catch (err) {
      return res.status(403).json({ success: false, message: "CAPTCHA verification failed or expired." });
    }
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required." });
      }

  try {
    const user = await UserModel.findOne({ email });
    const allowedRoles = ["admin", "super-admin", "admin-manager"];
    if (!user || !user.roles.some(role => allowedRoles.includes(role))) {
      return res.status(401).json({ message: "Unauthorized Access." });
    }

    // --- Find admin profile ---
    const admin = await AdminProfile.findOne({ user: user._id }).select(
      "+failedLoginAttempts +lockUntil +twoFASecret +is2FAVerified +isDisabled"
    );
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized access. ❌" });
    }

    // --- Account lock check ---
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      return res.status(423).json({ success: false, message: `Account locked until ${new Date(admin.lockUntil).toLocaleString()}` });
    }

    // --- Password check ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= 10) {
        admin.lockUntil = Date.now() + 15 * 60 * 1000; 
        admin.failedLoginAttempts = 0;
      }
      await admin.save();
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;

    // --- IP allowlist ---
    const allowedIPs = process.env.ALLOWED_IPS
      ? process.env.ALLOWED_IPS.split(",").map((ip) => ip.trim())
      : [];
    let clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
    if (clientIP.includes(",")) clientIP = clientIP.split(",")[0].trim();
    if (clientIP === "::1") clientIP = "127.0.0.1";
    if (allowedIPs.length && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({ success: false, message: "Access denied from this IP address." });
    }

    // --- 2FA check ---
    if (process.env.ENABLE_2FA === "true" && !admin.is2FAVerified) {
      const tempToken = jwt.sign(
        { id: user._id, pre2FA: true, roles: user.roles },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      await admin.save();
      return res.status(403).json({
        success: false,
        message: "2FA verification required.",
        pre2FAToken: tempToken,
      });
    }

    // --- Generate tokens ---
    const accessToken = signAccessToken(user);
    const refreshTokenRaw = signRefreshToken(user);
    const hashedToken = await bcrypt.hash(refreshTokenRaw, 10);

    if (!Array.isArray(user.refreshTokens)) user.refreshTokens = [];
    user.refreshTokens.push({
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await user.save();
    await admin.save();

    setAppCookie(res, "adminRefreshToken", refreshTokenRaw, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:"/api/admin",
    });
    setAppCookie(res, "adminAccessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
      sameSite: "Strict",
      path:"/api/admin",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      roles: user.roles,
      id: user._id,
    });
  } catch (error) {
    logger.error("adminLogin: server error", { error });
    return res.status(500).json({ success: false, message: "Server error." });
  }
};



#verifyCatcha

const verifyRecaptchaHold = (req, res) => {
  const { holdDuration, startedAt } = req.body;

  // 1. Ensure it was held long enough (e.g. >= 2500ms)
  const now = Date.now();
  const heldTime = now - startedAt;

  if (!startedAt || !holdDuration || heldTime < 2000) {
    return res.status(400).json({ success: false, message: "CAPTCHA not held long enough." });
  }

  // 2. Issue a short-lived CAPTCHA token
  const captchaToken = jwt.sign(
    { passed: true, iat: Math.floor(now / 1000) },
    process.env.CAPTCHA_SECRET,
    { expiresIn: "3m" }
  );

  return res.status(200).json({ success: true, captchaToken });
};




#frontend
import { useState, useRef } from "react";
import { Box, Button, LinearProgress, Typography } from "@mui/material";

const HOLD_DURATION = 2500; // ms

const ClickHoldCaptcha = ({ onSuccess, disabled }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdStart = useRef(null);
  const intervalRef = useRef(null);

  const handleMouseDown = () => {
    if (disabled) return;
    setIsHolding(true);
    holdStart.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const percent = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(percent);

      if (percent >= 100) {
        clearInterval(intervalRef.current);
        setIsHolding(false);
        setProgress(100);

        // Send to server
        fetch("/api/admin/verify-captcha-hold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdDuration: elapsed, startedAt: holdStart.current }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.captchaToken) {
              onSuccess(data.captchaToken);
            } else {
              throw new Error("CAPTCHA failed");
            }
          })
          .catch(() => {
            alert("CAPTCHA verification failed. Try again.");
            setProgress(0);
          });
      }
    }, 20);
  };

  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    if (progress < 100) {
      setIsHolding(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
        Click and hold the button to verify you're human
      </Typography>
      <Button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={disabled}
        variant="outlined"
        fullWidth
        sx={{ minHeight: 50 }}
      >
        {isHolding ? "Verifying..." : "Click & Hold to Verify"}
      </Button>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mt: 1, height: 6, borderRadius: 1 }}
      />
    </Box>
  );
};

export default ClickHoldCaptcha;




import {
  Modal,
  Box,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { MdSecurity } from "react-icons/md";
import ClickHoldCaptcha from "../ClickHoldCaptcha/ClickHoldCaptcha";

const CaptchaModal = ({ open, onVerify }) => {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={() => {}}
      aria-labelledby="captcha-modal"
      disableEscapeKeyDown
    >
      <Box
        sx={{
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          mx: "auto",
          mt: "15vh",
          textAlign: "center",
        }}
      >
        <MdSecurity size={48} color={theme.palette.primary.main} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Let’s verify you’re a human
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          Please click and hold the button below to securely complete login.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <ClickHoldCaptcha onSuccess={onVerify} />
      </Box>
    </Modal>
  );
};

export default CaptchaModal;




import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Howl } from "howler";
import axiosInstanceAdmin from "../../../../axiosInstanceAdmin";
import "./AdminLogin.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminInfo,
  selectIsAdminAuthenticated,
  selectAdminAuthChecked,
} from "../../../features/admin/adminSlice";
import CaptchaModal from "../../components/CaptchaModal/CaptchaModal";

const successTone = new Howl({
  src: ["/sounds/apple-sms.mp3"],
  volume: 1,
  autoplay: false,
});

const AdminLoginInner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAdminAuthenticated);
  const authChecked = useSelector(selectAdminAuthChecked);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [pendingLoginValues, setPendingLoginValues] = useState(null);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, isAuthenticated, authChecked]);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&]).{8,}$/,
        "Must include uppercase, lowercase, number, special char"
      )
      .required("Password is required"),
  });

  const handleCaptchaVerified = async (token) => {
    setCaptchaModalOpen(false);

    if (!pendingLoginValues) {
      toast.error("Unexpected error. Try again.");
      return;
    }

    await attemptLogin({ ...pendingLoginValues, captchaToken: token }, () => {});
  };

  const attemptLogin = async (payload, setSubmitting) => {
    try {
      const response = await axiosInstanceAdmin.post(
        "/api/admin/login",
        payload,
        { withCredentials: true }
      );

      if (response.data.pre2FAToken) {
        localStorage.setItem("temp2FAToken", response.data.pre2FAToken);
        sessionStorage.setItem("pending2FA", payload.email);
        toast.info("Two-Factor Authentication required. Redirecting…");
        navigate("/admin/setup-2fa", { replace: true });
      } else if (response.data.success) {
        await dispatch(fetchAdminInfo()).unwrap();
        successTone.play();
        toast.success(response.data.message || "Login successful.");
        localStorage.removeItem("temp2FAToken");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.data.message || "Login failed.");
      }
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 403 && data?.pre2FAToken) {
        localStorage.setItem("temp2FAToken", data.pre2FAToken);
        sessionStorage.setItem("pending2FA", payload.email);
        toast.info("Two-Factor Authentication required. Redirecting…");
        navigate("/admin/setup-2fa", { replace: true });
      } else if (error.response && error.response.status === 423) {
        toast.warn(error.response.data.message || "Your account is temporarily suspended. Please try again later.", { autoClose: 5000 });
      } else if (error.response && error.response.status === 401) {
        toast.warn(error.response.data.message || "Not authorized to login here.");
      } else if (error.response && error.response.status === 404) {
        toast.error(error.response.data.message || "Invalid credentials. Password mismatch.");
      } else if (error.response && error.response.status === 503) {
        toast.error(error.response.data.message || "Server down. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div className="overlay">
      <div className="logo">
        <img src="/TT-logo.png" alt="TransBook logo" />
      </div>
      <div className="form">
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center", color: "gray" }}>
          Administrator Login
        </Typography>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            setIsSubmitting(true);
            setSubmitting(false);
            setPendingLoginValues(values);
            setCaptchaModalOpen(true);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <>
              <CaptchaModal open={captchaModalOpen} onVerify={handleCaptchaVerified} />
              <form onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter admin email"
                    fullWidth
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaEnvelope style={{ marginRight: 8 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    fullWidth
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock style={{ marginRight: 8 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePassword} edge="end">
                            {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 2, textAlign: "right" }}>
                  <a
                    href="/admin/forgot-password"
                    style={{
                      color: "#1A73E8",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </a>
                </Typography>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : "Login"}
                  </Button>
                </Box>
              </form>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

const AdminLogin = () => (
  <div className="admin-login-container">
    <AdminLoginInner />
  </div>
);

export default AdminLogin;





