import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaEnvelope } from "react-icons/fa";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { Helmet } from "react-helmet-async";

const ForgotPasswordDriver = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Define validation schema with Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  // Use Formik's onSubmit along with our local state updates
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setLoading(true);
    try {
      const res = await axiosInstanceDriver.post(`/api/driver/forgot-password`, {
        email: values.email,
      });
      setMessage(res.data.message);
      resetForm();
    } catch (error) {
      setMessage(
        "Error: " + (error.response?.data.message || "Something went wrong")
      );
    }
    setLoading(false);
    setSubmitting(false);
  };

  return (
        <>
        <Helmet>
          <title>Forgot Password - TOLI-Driver</title>
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
        onClick={() => navigate(-1)}
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
          <b>Forgot Password</b>
        </Typography>
        <Typography sx={{ textAlign: "center", mb: 4 }}>
          Enter your email to receive a password reset link.
        </Typography>

        <Formik
          initialValues={{ email: "" }}
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
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your admin email"
                  fullWidth
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope style={{ marginRight: "8px" }} />
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
                    "Send Reset Link"
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

export default ForgotPasswordDriver;
