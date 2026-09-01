import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdArrowUpward,
  MdHeadsetMic,
  MdHistory,
  MdPayments,
  MdPerson,
  MdSupportAgent,
} from "react-icons/md";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="driver-footer">
      <div className="driver-footer__container">

        {/* =====================================================
            TOP SECTION
        ===================================================== */}

        <div className="driver-footer__top">

          {/* BRAND */}
          <div
            className="driver-footer__brand"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigate("/");
              }
            }}
          >
            <div className="driver-footer__logo-wrap">
              <img
                src="/GN-logo.png"
                alt="GoOn"
                className="driver-footer__logo"
              />
            </div>

            <div className="driver-footer__brand-copy">
              <span className="driver-footer__brand-name">
                GoOn
              </span>

              <span className="driver-footer__brand-tagline">
                Driver platform
              </span>
            </div>
          </div>


          {/* DESCRIPTION */}
          <div className="driver-footer__description">
            <span className="driver-footer__eyebrow">
              DRIVE WITH CONFIDENCE
            </span>

            <p>
              Manage your rides, earnings and driver
              experience from one connected platform.
            </p>
          </div>


          {/* ASSISTANCE */}
          <a
            href="tel:+233246062758"
            className="driver-footer__assistance"
          >
            <span className="driver-footer__assistance-icon">
              <MdHeadsetMic size={19} />
            </span>

            <span className="driver-footer__assistance-copy">
              <small>
                DRIVER ASSISTANCE
              </small>

              <strong>
                +233 24 606 2758
              </strong>
            </span>
          </a>

        </div>


        <div className="driver-footer__divider" />


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <div className="driver-footer__middle">

          <div className="driver-footer__section">
            <span className="driver-footer__section-title">
              DRIVER CONSOLE
            </span>

            <div className="driver-footer__links">

              <Link to="/dashboard">
                <span className="driver-footer__link-icon">
                  <MdSupportAgent size={17} />
                </span>
                Dashboard
              </Link>

              <Link to="/history">
                <span className="driver-footer__link-icon">
                  <MdHistory size={17} />
                </span>
                Ride History
              </Link>

              <Link to="/earnings">
                <span className="driver-footer__link-icon">
                  <MdPayments size={17} />
                </span>
                Earnings
              </Link>

              <Link to="/profile-settings">
                <span className="driver-footer__link-icon">
                  <MdPerson size={17} />
                </span>
                Profile Settings
              </Link>

              <Link to="/support">
                <span className="driver-footer__link-icon">
                  <MdSupportAgent size={17} />
                </span>
                Support
              </Link>

            </div>
          </div>


          {/* PLATFORM */}
          <div className="driver-footer__section driver-footer__platform">

            <span className="driver-footer__section-title">
              GOON PLATFORM
            </span>

            <div className="driver-footer__platform-info">

              <div>
                <span className="driver-footer__status-dot" />

                <span>
                  Driver services operational
                </span>
              </div>

              <p>
                Real-time ride management and connected
                driver services.
              </p>

            </div>

          </div>

        </div>


        <div className="driver-footer__divider" />


        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div className="driver-footer__bottom">

          <div className="driver-footer__copyright">
            <span>
              © {currentYear} GoOn
            </span>

            <span className="driver-footer__bottom-dot">
              •
            </span>

            <span>
              All rights reserved.
            </span>
          </div>


          <div className="driver-footer__legal">
            <Link to="/terms">
              Terms
            </Link>

            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/support">
              Help Center
            </Link>
          </div>


          <button
            type="button"
            className="driver-footer__back-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>
              Back to top
            </span>

            <MdArrowUpward size={16} />
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;