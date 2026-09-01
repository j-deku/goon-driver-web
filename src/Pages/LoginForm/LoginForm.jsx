/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import {motion} from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Howl } from "howler";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsDriverAuthenticated,
  selectDriverAuthChecked,
  selectDriverLoading,
  fetchDriverInfo,
} from "../../features/driver/driverSlice";
import { Helmet } from "react-helmet-async";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsDriverAuthenticated);
  const authChecked = useSelector(selectDriverAuthChecked);
  const isLoading = useSelector(selectDriverLoading);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const AUTH_DR_LK = import.meta.env.VITE_AUTH_LINK_DR; 

  // Success tone
  const successTone = useRef(new Howl({ src: ["/sounds/apple-sms.mp3"], volume: 1 })).current;

  useEffect(() => {
    if (!authChecked) return;

    if (isAuthenticated) {
      const dest = pendingNavigation || "/dashboard";
      navigate(dest, { replace: true });
      setPendingNavigation(null);
    }
  }, [authChecked, isAuthenticated, navigate, pendingNavigation]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Use strong password")
      .required("Password is required"),
  });

  // Submit login
  const handleSubmit = async (values) => {
    let mounted = true;
    setIsSubmitting(true);

    try {
      const { data } = await axiosInstanceDriver.post("/api/driver/login", values, {
        withCredentials: true,
      });

      if (!data.success) throw new Error(data.message);

      successTone.play();
      toast.success(data.message);

      if (data.driverId) {
        localStorage.setItem("driverId", data.userId || data.driverId);
      }

      await dispatch(fetchDriverInfo());

      const params = new URLSearchParams(window.location.search);
      setPendingNavigation(params.get("redirect") || "/dashboard");
    } catch (err) {
      const codeMsg = {
        401: "Incorrect credentials",
        403: "Account not approved or inactive",
        404: "Driver profile not found",
        422: "Missing required fields",
        423: "Account locked. Try again later",
        500: "Server error. Try again soon",
      };
      const msg = codeMsg[err.response?.status] || err.message;

      setMessage(msg);
    } finally {
      if (mounted) setIsSubmitting(false);
    }

    return () => (mounted = false);
  };

  if (!authChecked || isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Driver Login - GoOn</title>
      </Helmet>

      {/* Background container */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgba(250, 251, 253, 0.8), rgba(31, 30, 30, 0.7)), url('/blue-car.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: 2,
        }}
      >
       <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Paper
            elevation={5}
            sx={{
              width: "100%",
              padding: 4,
              borderRadius: 3,
              backdropFilter: "blur(14px)",
              background: "rgba(255,255,255,0.88)",
            }}
          >

          <Box sx={{ textAlign: "center", mb: 2, background:"linear-gradient(90deg, black, gray)", borderRadius:1}}>
            <motion.img
              src="/GN-logo.png"
              alt="GoOn Logo"
              style={{ width: 80, marginBottom: 8 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Driver Login
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#ccc" }}>
              Access your driver account
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <TextField
                  name="email"
                  label="Email Address"
                  placeholder="raymond@example.com"
                  type="email"
                  fullWidth
                  required
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope size={16} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  name="password"
                  label="Password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock size={16} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {message && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {message}
                  </Alert>
                )}

                <Typography variant="body2" sx={{ mb: 2, textAlign: "right" }}>
                  <NavLink to={`${AUTH_DR_LK}/forgot-password`} style={{textDecoration:"underline", color:"Highlight"}}>Forgot Password?</NavLink>
                </Typography>

                <motion.div whileTap={{ scale: 0.96 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ py: 1.3, fontWeight: "bold", borderRadius: 2,backgroundColor:"gray"}}
                    startIcon={isSubmitting && <CircularProgress size={20} />}
                  >
                    {isSubmitting ? "Logging in…" : "Login"}
                  </Button>
                </motion.div>

                <Typography variant="body2" sx={{ textAlign: "center", mt: 3 }}>
                  Not registered?{" "}
                  <NavLink to={`${AUTH_DR_LK}/register`} style={{textDecoration:"underline", color:"Highlight"}}>Create an account</NavLink>
                </Typography>
              </Form>
            )}
          </Formik>
          </Paper>
        </motion.div>
      </Box>
    </>
  );
};

export default LoginForm;
