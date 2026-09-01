/* eslint-disable no-unused-vars */
import React from "react";
import "./FormSubmitted.css";
import { Skeleton, Button, Result } from "antd";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useNavigate } from "react-router-dom";

const FormSubmitted = () => {
  const [status, setStatus] = React.useState("loading"); // "loading" | "success" | "error"
  const [email, setEmail] = React.useState("");
  const navigate = useNavigate();

  const fetchSubmissionStatus = async () => {
    try {
      const response = await axiosInstanceDriver.get("/api/driver/form-submitted", {
        withCredentials: true,
      });

      if (response.data?.success) {
        setEmail(response.data?.data?.email || "");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("❌ Error fetching form submission:", error);
      setStatus("error");
    }
  };

  React.useEffect(() => {
    fetchSubmissionStatus();
  }, []);

  const retryFetch = () => {
    setStatus("loading");
    fetchSubmissionStatus();
  };

  const goToHome = () => {
    navigate("/driver");
  }

  return (
    <>
      <Helmet>
        <title>Form Submitted - GoOn Driver</title>
      </Helmet>

      <div className="overlay">
        {status === "loading" && (
          <div className="loading-screen" style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Checking your submission...</h2>
            <Skeleton active paragraph={{ rows: 4 }} style={{ margin: 50 }} title={false} />
          </div>
        )}

        {status === "error" && (
          <motion.div
            className="error-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginTop: "80px" }}
          >
            <Result
              status="warning"
              title="No recent driver registration found"
              subTitle="It seems we couldn’t verify your form submission. Please try registering again or refresh the page."
              extra={[
                <Button key="retry" type="primary" onClick={retryFetch}>
                  Retry
                </Button>,
              ]}
            />
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            className="form-submitted"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
            className="form-submitted"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1>
              Success!{" "} 
              <motion.span
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                ✅
              </motion.span>
            </h1>
            </motion.div>
            <p>
              <em>
                Thanks, your registration form has been submitted successfully.
                <br />
                <br />
                <strong>Registered email:</strong> {email || "Hidden for security"}
                <br />
                <br />
                Please allow 2–3 business days for admin approval.
                <br />
                We’ll notify you via email once your driver account is reviewed.
              </em>
            </p>
            <Skeleton active paragraph={{ rows: 4 }} title={false} className="loader" />
          <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button type="default" onClick={goToHome}>
            Go to Home
          </Button>
        </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default FormSubmitted;
