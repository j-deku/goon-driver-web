import React from "react";
import {
Box,
Container,
Typography,
Paper,
Divider,
Stack,
} from "@mui/material";
import {
FaShieldAlt,
FaUserShield,
FaLock,
FaDatabase,
FaEye,
FaCookieBite,
FaEnvelope,
FaArrowLeft,
FaLocationArrow,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Privacy.css";

const privacySections = [
{
icon: <FaDatabase />,
title: "Information We Collect",
content:
"We collect information necessary to provide, improve, and secure the GoOn driver platform. This may include your profile information, contact details, vehicle information, trip activity, and location data while you are using the driver application.",
},
{
icon: <FaLocationArrow />,
title: "Location Information",
content:
"The driver application may collect your location while you are online or actively completing a trip. Location information helps us connect you with passengers, provide navigation features, improve trip safety, and support the operation of our services.",
},
{
icon: <FaUserShield />,
title: "How We Use Your Information",
content:
"Your information is used to manage your driver account, facilitate ride services, process trips, provide customer support, improve platform performance, prevent fraudulent activity, and maintain the safety and security of the GoOn community.",
},
{
icon: <FaEye />,
title: "Information Sharing",
content:
"We only share information when necessary to provide our services, comply with legal requirements, protect the safety of our users, or support essential business operations. We do not sell your personal information to third parties.",
},
{
icon: <FaLock />,
title: "Security of Your Information",
content:
"We use appropriate technical and organizational measures to help protect your information from unauthorized access, loss, misuse, or disclosure. However, no digital system can guarantee absolute security.",
},
{
icon: <FaCookieBite />,
title: "Cookies and Similar Technologies",
content:
"Our websites and services may use cookies and similar technologies to maintain sessions, remember preferences, improve functionality, analyze performance, and enhance your overall experience.",
},
];

const Privacy = () => {
const navigate = useNavigate();

return ( <Box className="privacy-page"> <Container maxWidth="lg">
{/* Header */} <Box className="privacy-header">
<button
className="privacy-back-button"
onClick={() => navigate(-1)}
aria-label="Go back"
> <FaArrowLeft /> </button>

      <Box className="privacy-title-section">
        <Box className="privacy-icon">
          <FaShieldAlt />
        </Box>

        <Box>
          <Typography variant="h3" className="privacy-title">
            Privacy & Security
          </Typography>

          <Typography className="privacy-subtitle">
            Learn how GoOn protects your information and keeps your
            driver account secure.
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Security Highlight */}
    <Paper className="privacy-security-card" elevation={0}>
      <Box className="privacy-security-icon">
        <FaShieldAlt />
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={700}>
          Your privacy matters to us
        </Typography>

        <Typography className="privacy-security-text">
          GoOn is committed to handling your personal information
          responsibly and maintaining strong security practices across
          our driver platform.
        </Typography>
      </Box>
    </Paper>

    {/* Privacy Sections */}
    <Stack spacing={2.5} className="privacy-sections">
      {privacySections.map((section, index) => (
        <Paper
          className="privacy-section-card"
          elevation={0}
          key={index}
        >
          <Box className="privacy-section-icon">
            {section.icon}
          </Box>

          <Box className="privacy-section-content">
            <Typography
              variant="h6"
              className="privacy-section-title"
            >
              {section.title}
            </Typography>

            <Typography className="privacy-section-text">
              {section.content}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Stack>

    {/* Account Security */}
    <Paper className="privacy-account-card" elevation={0}>
      <Box className="privacy-account-header">
        <FaLock />

        <Typography variant="h6">
          Keep Your Account Secure
        </Typography>
      </Box>

      <Box className="privacy-security-tips">
        <div>
          <span>01</span>
          <Typography>
            Never share your account password with anyone.
          </Typography>
        </div>

        <div>
          <span>02</span>
          <Typography>
            Always sign out when using a shared device.
          </Typography>
        </div>

        <div>
          <span>03</span>
          <Typography>
            Report suspicious account activity immediately.
          </Typography>
        </div>

        <div>
          <span>04</span>
          <Typography>
            Keep your contact information up to date.
          </Typography>
        </div>
      </Box>
    </Paper>

    <Divider className="privacy-divider" />

    {/* Contact */}
    <Box className="privacy-contact">
      <Box className="privacy-contact-icon">
        <FaEnvelope />
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={700}>
          Questions about your privacy?
        </Typography>

        <Typography color="text.secondary">
          Contact the GoOn support team if you have questions about how
          your information is collected, used, or protected.
        </Typography>
      </Box>
    </Box>

    {/* Footer */}
    <Typography className="privacy-updated">
      Last updated: September 2026
    </Typography>
  </Container>
</Box>

);
};

export default Privacy;
