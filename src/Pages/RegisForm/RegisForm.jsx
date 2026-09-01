/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
} from "@mui/material";
import {motion} from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";

const theme = createTheme({
  palette: { mode: "light" },
});
const steps = ["Personal Info", "Vehicle Info", "Preview & Confirm"];
const validationSchemas = [
  Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
    .min(6, "Minimum 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required("Password is required"),
    phone: Yup.number().min(8).required("Phone number is required"),
  }),
  Yup.object({
    licenseNumber: Yup.string().required("License number is required"),
    vehicleType: Yup.string().required("Vehicle type is required"),
    model: Yup.string().required("Vehicle model is required"),
    registrationNumber: Yup.string().required("Registration number is required"),
    capacity: Yup.number().min(1).required("Capacity is required"),
  }),
];

export default function DriverRegistrationForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const AUTH_DR_LK = import.meta.env.VITE_AUTH_LINK_DR; 

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      licenseNumber: "",
      vehicleType: "",
      model: "",
      registrationNumber: "",
      capacity: "",
    },
    validationSchema: validationSchemas[activeStep],
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!avatar) {
        setErrorMsg("Profile photo is required");
        setOpenError(true);
        return;
      }
      setLoading(true);
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(k, v));
      formData.append("avatar", avatar);
      try {
        const res = await axiosInstanceDriver.post("/api/driver/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });

        if (res.data.success) {
          localStorage.setItem("driverId", res.data.driver.id);

          try {
            const check = await axiosInstanceDriver.get("/api/driver/form-submitted", {
              withCredentials: true,
            });
            if (check.data.success) {
              setOpenSuccess(true);
            } else {
              setErrorMsg("Cookie not found yet. Try refreshing or re-registering.");
              setOpenError(true);
            }
          } catch (verifyErr) {
            console.error("Cookie check failed:", verifyErr);
            setErrorMsg("Unable to verify session. Please try again later.");
            setOpenError(true);
          }
        }
        else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        if(err.response && err.response.status === 409) {
          setErrorMsg( err.response.data.message ||"Email already exists. Please use a different email.");
          setOpenError(true);
        }else if (err.code === "ERR_NETWORK") {
          setErrorMsg("Network error. Please check your internet connection.");
          setOpenError(true);
        }else if (err.response && err.response.status === 500) {
          setErrorMsg(err.response.data.message || "Server error. Please try again later.");
          setOpenError(true);
        } else {
          setErrorMsg(err.message || "An unexpected error occurred.");
          setOpenError(true);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    formik.setTouched(
      Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (Object.keys(errors).length === 0) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
        <>
        <Helmet>
          <title>Registration - Driver</title>
        </Helmet>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              mt: 5,
              p: 4,
              background: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
        <Box textAlign="center" mb={3} sx={{background:"linear-gradient(90deg, black, gray)", borderRadius:2}}>
          <img src="/GN-logo.png" alt="Logo" width={80} />
          <Typography variant="h5" mt={2} color="white">Driver Registration</Typography>
        </Box>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={2} mt={2}>
            {activeStep === 0 && (
              <>
                {['name','email','password','phone'].map((field) => (
                  <Grid item xs={12} key={field}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      name={field}
                      type={field === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
                      value={formik.values[field]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field] && Boolean(formik.errors[field])}
                      helperText={formik.touched[field] && formik.errors[field]}
                      InputProps={
                        field === 'password' ? {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        } : null
                      }
                    />
                  </Grid>
                ))}
              </>
            )}
            {activeStep === 1 && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={formik.values.licenseNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                    helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.vehicleType && Boolean(formik.errors.vehicleType)}>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicleType"
                      value={formik.values.vehicleType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Vehicle Type">
                      {['Car','Van','Bus','Motorbike','Truck'].map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.vehicleType && formik.errors.vehicleType && <Typography variant="caption" color="error">{formik.errors.vehicleType}</Typography>}
                  </FormControl>
                </Grid>
                {['model','registrationNumber','capacity'].map(field => (
                  <Grid item xs={12} key={field}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                      name={field}
                      type={field === 'capacity' ? 'number' : 'text'}
                      value={formik.values[field]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field] && Boolean(formik.errors[field])}
                      helperText={formik.touched[field] && formik.errors[field]}
                    />
                  </Grid>
                ))}
              </>
            )}
            {activeStep === 2 && (
              <>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label" fullWidth sx={{backgroundColor:"gray"}}>
                    Upload Profile Photo
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Grid>
                {previewImage && (
                  <Grid item xs={12} textAlign="center">
                    <Avatar src={previewImage} sx={{ width: 100, height: 100, mx: 'auto', mt: 2 }} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6">Preview Information</Typography>
                  <List>
                    {Object.entries(formik.values).map(([key,val]) => (
                      <ListItem key={key} divider>
                        <ListItemText primary={key} secondary={val} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </>
            )}
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button disabled={activeStep===0} onClick={handleBack}>Back</Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} sx={{backgroundColor:"gray"}}>Next</Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                  sx={{backgroundColor:"gray"}}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>

        <Dialog open={openSuccess} onClose={() => navigate(`${AUTH_DR_LK}/form-submitted`)}> 
          <DialogTitle>Success ✅</DialogTitle>
          <Divider />
          <DialogContent>
            <Typography>Registration successful. Please check your email.</Typography>
            <Skeleton variant="rectangular" width="100%" height={118} sx={{ mt: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', mt: 1 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate(`${AUTH_DR_LK}/login`)} sx={{backgroundColor:"gray"}}>Go to Login</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openError} onClose={() => setOpenError(false)}>
          <DialogTitle>Error ❌</DialogTitle>
          <Divider/>
          <DialogContent>
            <Typography color="error">{errorMsg}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenError(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>Already have an account? 
          <NavLink style={{color:"blue", fontWeight:600}} to="/"> Go to Login </NavLink>
        </Typography>
        </Box>
    </motion.div>
    </ThemeProvider>
    </>
  );
}
