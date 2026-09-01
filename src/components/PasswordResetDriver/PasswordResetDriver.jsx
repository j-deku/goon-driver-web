import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { Helmet } from "react-helmet-async";

const PasswordResetDriver = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  // Yup Validation Schema
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character."
      )
      .required("Password is required"),
  });

  // Form submit handler that updates local state message
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setLoading(true);
    try {
      const res = await axiosInstanceDriver.post(`/api/driver/reset-password/${token}`,
        { newPassword: values.password }
      );
      setMessage(res.data.message);
      resetForm();
      // Redirect to login page after 3 seconds
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setMessage(
        "Error: " +
          (error.response?.data.message || "Something went wrong")
      );
    }
    setLoading(false);
    setSubmitting(false);
  };

  return (
        <>
        <Helmet>
          <title>Reset Password - TOLI-Driver</title>
        </Helmet>
    <div className="overlay">
      <FaArrowCircleLeft
        style={{
          width: 40,
          height: 40,
          float: "left",
          margin: 40,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      />
      <Box
        className="container"
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 18,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
          <b>Reset Password</b>
        </Typography>
        <Typography sx={{ textAlign: "center", mb: 4 }}>
          Enter a new password for your driver account.
        </Typography>

        <Formik
          initialValues={{ password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  name="password"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  fullWidth
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePassword}>
                          {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {message && (
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    textAlign: "center",
                    color: message.startsWith("Error") ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {message}
                </Typography>
              )}

              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </div>
    </>
  );
};

export default PasswordResetDriver;