import { useState } from "react";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { toast } from "react-toastify";
import "./SupportDriver.css";
// import { useSelector } from "react-redux";
// import { selectIsDriverAuthenticated } from "../../feature/driver/driverSlice";

const SupportDriver = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axiosInstanceDriver.post(
        "/api/driver/support",
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ subject: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to submit support request.");
      }
    } catch (error) {
      console.error("Error submitting support request:", error.response?.data || error.message);
      toast.error("Error submitting support request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <h2>Support</h2>
      <p>
        If you have any issues, questions, or feedback, please fill in the form below to contact our support team.
      </p>
      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter subject"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your message"
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default SupportDriver;