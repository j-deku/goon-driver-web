import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdDescription,
  MdGavel,
  MdVerifiedUser,
  MdDirectionsCar,
  MdPayments,
  MdWarningAmber,
  MdContactSupport,
  MdCheckCircle,
  MdUpdate,
} from "react-icons/md";

import "./Terms.css";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <MdVerifiedUser />,
      title: "Driver Eligibility",
      content:
        "To use the GoOn Driver platform, you must provide accurate registration information and maintain all licences, permits, insurance, and other documents required to legally operate as a driver.",
    },
    {
      icon: <MdDirectionsCar />,
      title: "Driver Responsibilities",
      content:
        "Drivers are responsible for maintaining their vehicles in a safe and roadworthy condition, treating passengers respectfully, and complying with all applicable traffic laws and regulations.",
    },
    {
      icon: <MdPayments />,
      title: "Payments & Earnings",
      content:
        "Your earnings are calculated based on completed rides and the applicable pricing structure. Payment processing, platform fees, and any applicable adjustments will be clearly reflected in your driver account.",
    },
    {
      icon: <MdGavel />,
      title: "Platform Rules",
      content:
        "Drivers must use the GoOn platform honestly and responsibly. Fraudulent activity, manipulation of ride information, abuse of the platform, or attempts to bypass platform systems may result in account suspension or termination.",
    },
    {
      icon: <MdWarningAmber />,
      title: "Safety & Conduct",
      content:
        "The safety of drivers and passengers is a priority. Dangerous behaviour, harassment, discrimination, violence, or operating a vehicle while impaired is strictly prohibited.",
    },
    {
      icon: <MdContactSupport />,
      title: "Account Support",
      content:
        "If you experience an issue with your driver account or a ride, you can contact GoOn Support through the Driver platform for assistance.",
    },
  ];

  return (
    <div className="driver-terms-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="driver-terms-hero">

        <div className="driver-terms-hero__background" />

        <div className="driver-terms-container">

          <button
            className="driver-terms-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <MdArrowBack />
          </button>

          <div className="driver-terms-hero__content">

            <div className="driver-terms-icon">
              <MdDescription />
            </div>

            <div>
              <span className="driver-terms-eyebrow">
                GOON DRIVER PLATFORM
              </span>

              <h1>
                Terms & Conditions
              </h1>

              <p>
                Please review the terms that govern your use
                of the GoOn Driver platform.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="driver-terms-main">

        <div className="driver-terms-container">

          {/* INTRODUCTION */}

          <section className="terms-introduction">

            <div className="terms-introduction__header">

              <div className="terms-introduction__icon">
                <MdGavel />
              </div>

              <div>
                <span>
                  AGREEMENT
                </span>

                <h2>
                  Welcome to GoOn
                </h2>
              </div>

            </div>

            <p>
              These Terms and Conditions govern your use of
              the GoOn Driver platform. By creating an account
              or using our services, you agree to comply with
              these terms and all applicable laws and regulations.
            </p>

            <p>
              We encourage every driver to carefully review
              these terms before using the platform.
            </p>

          </section>


          {/* HIGHLIGHTS */}

          <section className="terms-highlights">

            <div className="terms-highlight">

              <div className="terms-highlight__icon">
                <MdCheckCircle />
              </div>

              <div>
                <strong>
                  Professional Conduct
                </strong>

                <span>
                  Maintain respectful and professional behaviour.
                </span>
              </div>

            </div>


            <div className="terms-highlight">

              <div className="terms-highlight__icon">
                <MdVerifiedUser />
              </div>

              <div>
                <strong>
                  Safe Driving
                </strong>

                <span>
                  Follow all traffic and safety regulations.
                </span>
              </div>

            </div>


            <div className="terms-highlight">

              <div className="terms-highlight__icon">
                <MdDescription />
              </div>

              <div>
                <strong>
                  Accurate Information
                </strong>

                <span>
                  Keep your account and vehicle details updated.
                </span>
              </div>

            </div>

          </section>


          {/* TERMS SECTIONS */}

          <section className="terms-sections">

            <div className="terms-section-heading">

              <span>
                DRIVER AGREEMENT
              </span>

              <h2>
                Your responsibilities
              </h2>

              <p>
                These important guidelines help maintain a safe,
                reliable and professional experience for everyone.
              </p>

            </div>


            <div className="terms-grid">

              {sections.map((section, index) => (

                <article
                  className="terms-card"
                  key={section.title}
                >

                  <div className="terms-card__number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="terms-card__icon">
                    {section.icon}
                  </div>

                  <h3>
                    {section.title}
                  </h3>

                  <p>
                    {section.content}
                  </p>

                </article>

              ))}

            </div>

          </section>


          {/* ACCEPTANCE */}

          <section className="terms-acceptance">

            <div className="terms-acceptance__content">

              <div className="terms-acceptance__icon">
                <MdCheckCircle />
              </div>

              <div>

                <span>
                  YOUR AGREEMENT
                </span>

                <h2>
                  By using GoOn, you agree to these terms
                </h2>

                <p>
                  Continued use of the GoOn Driver platform
                  indicates your acceptance of these Terms
                  and Conditions.
                </p>

              </div>

            </div>

          </section>


          {/* LAST UPDATED */}

          <div className="terms-last-updated">

            <MdUpdate />

            <span>
              Last updated: September 2026
            </span>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Terms;