import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdClose,
  MdLogout,
  MdMenu,
  MdSettings,
  MdDashboard,
  MdHistory,
  MdPayments,
  MdSupportAgent,
  MdDirectionsCar,
} from "react-icons/md";

import DriverNotifications from "../DriverNotifications/DriverNotifications";
import { useDispatch, useSelector } from "react-redux";
import {
  driverLogout,
  selectDriverInfo,
} from "../../features/driver/driverSlice";

import "./Navbar.css";

import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { FaArrowDown } from "react-icons/fa";

const Navbar = () => {
  const [showProfileDetails, setShowProfileDetails] =
    useState(false);

  const [showMenuLinks, setShowMenuLinks] =
    useState(false);

  const [avatar, setAvatar] = useState("");

  const [isOnline, setIsOnline] = useState(null);

  const profileRef = useRef(null);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const driverIcon =
    import.meta.env.VITE_DRIVER_ICON;

  const driverInfo =
    useSelector(selectDriverInfo);

  const driverName =
    driverInfo?.name || "Driver";

  const driverImageUrl =
    driverInfo?.avatar || driverIcon;

  /* =========================================================
     ACTIVE ROUTE
  ========================================================= */

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    setShowProfileDetails(false);

    dispatch(driverLogout());

    window.location.href = "/";
  };

  /* =========================================================
     FETCH AVATAR
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchDriverAvatar = async () => {
      try {
        const response =
          await axiosInstanceDriver.get(
            "/api/driver/me",
            {
              withCredentials: true,
            }
          );

        if (
          mounted &&
          response.data?.success
        ) {
          setAvatar(
            response.data.driver?.avatar || ""
          );
        }
      } catch (error) {
        console.error(
          "Error fetching driver avatar:",
          error
        );
      }
    };

    fetchDriverAvatar();

    return () => {
      mounted = false;
    };
  }, []);


    useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const res = await axiosInstanceDriver.get(`/api/driver/me`, {
          withCredentials: true,
        });
        setIsOnline(!!res.data?.driver?.isOnline);
      } catch (err) {
        console.error("Failed to load driver status", err);
        setIsOnline(false); // fail safe: don't claim to be online if we don't know
      }
    };
    fetchOnlineStatus();
  }, []);

  /* =========================================================
     CLOSE MENUS WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfileDetails(false);
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setShowMenuLinks(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ========================================================= */

  useEffect(() => {
    setShowMenuLinks(false);
    setShowProfileDetails(false);
  }, [location.pathname]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: MdDashboard,
    },
    {
      label: "History",
      path: "/history",
      icon: MdHistory,
    },
    {
      label: "Earnings",
      path: "/earnings",
      icon: MdPayments,
    },
    {
      label: "Support",
      path: "/support",
      icon: MdSupportAgent,
    },
  ];

  return (
    <nav className="navbar">

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="navbar__left">

        <Link
          to="/dashboard"
          className="navbar__brand"
          aria-label="GoOn Driver Dashboard"
        >
          <img
            className="navbar__logo"
            src="/GN-logo.png"
            alt="GoOn"
          />
        </Link>

        <div className="navbar__brand-divider" />

        <div className="navbar__portal">
          <span className="navbar__portal-label">
            DRIVER
          </span>

          <span className="navbar__portal-status">
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </span>
        </div>

      </div>

      {/* =====================================================
          CENTER NAVIGATION
      ===================================================== */}

      <div className="navbar__center">

        <ul className="navbar__links">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>

                <Link
                  to={item.path}
                  className={`navbar__link ${
                    isActive(item.path)
                      ? "navbar__link--active"
                      : ""
                  }`}
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>
                </Link>

              </li>
            );
          })}

        </ul>

      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="navbar__right">

        {/* POST RIDE */}

        <button
          className="navbar__post-ride"
          onClick={() =>
            navigate("/create-ride")
          }
        >
          <MdDirectionsCar size={19} />

          <span>
            Post a Ride
          </span>
        </button>


        {/* NOTIFICATIONS */}

        <div className="navbar__notifications">
          <DriverNotifications />
        </div>


        {/* PROFILE */}

        <div
          className="navbar__profile-wrapper"
          ref={profileRef}
        >

          <button
            type="button"
            className={`navbar__profile-button ${
              showProfileDetails
                ? "navbar__profile-button--open"
                : ""
            }`}
            onClick={() =>
              setShowProfileDetails(
                (previous) =>
                  !previous
              )
            }
            aria-expanded={
              showProfileDetails
            }
          >

            <img
              className="navbar__profile"
              src={
                avatar ||
                driverImageUrl
              }
              alt={`${driverName} profile`}
            />

            <span className="navbar__profile-info">

              <span className="navbar__profile-name">
                {driverName}
              </span>

              <span className="navbar__profile-role">
                Driver
              </span>

            </span>

            <FaArrowDown
              className={`navbar__profile-chevron ${
                showProfileDetails
                  ? "navbar__profile-chevron--open"
                  : ""
              }`}
              size={20}
            />

          </button>


          {/* PROFILE DROPDOWN */}

          {showProfileDetails && (
            <div className="navbar__dropdown">

              <div className="navbar__dropdown-header">

                <img
                  src={
                    avatar ||
                    driverImageUrl
                  }
                  alt=""
                  className="navbar__dropdown-avatar"
                />

                <div>
                  <strong>
                    {driverName}
                  </strong>

                  <span>
                    {driverInfo?.email ||
                      "Driver account"}
                  </span>
                </div>

              </div>


              <div className="navbar__dropdown-divider" />


              {/* CONTACT */}

              <div className="navbar__dropdown-section">

                <span className="navbar__dropdown-section-title">
                  CONTACT
                </span>

                {driverInfo?.phone && (
                  <a
                    href={`tel:${driverInfo.phone}`}
                    className="navbar__dropdown-item"
                  >
                    <span>
                      Phone
                    </span>

                    <strong>
                      {driverInfo.phone}
                    </strong>
                  </a>
                )}

                {driverInfo?.email && (
                  <a
                    href={`mailto:${driverInfo.email}`}
                    className="navbar__dropdown-item"
                  >
                    <span>
                      Email
                    </span>

                    <strong>
                      {driverInfo.email}
                    </strong>
                  </a>
                )}

              </div>


              <div className="navbar__dropdown-divider" />


              {/* ACTIONS */}

              <button
                className="navbar__dropdown-action"
                onClick={() =>
                  navigate(
                    "/profile-settings"
                  )
                }
              >
                <span className="navbar__dropdown-action-icon">
                  <MdSettings size={18} />
                </span>

                <span>
                  Account settings
                </span>
              </button>


              <button
                className="navbar__dropdown-action navbar__dropdown-action--danger"
                onClick={logout}
              >
                <span className="navbar__dropdown-action-icon">
                  <MdLogout size={18} />
                </span>

                <span>
                  Sign out
                </span>
              </button>

            </div>
          )}

        </div>


        {/* MOBILE MENU */}

        <button
          ref={menuRef}
          type="button"
          className={`navbar__menu-button ${
            showMenuLinks
              ? "navbar__menu-button--open"
              : ""
          }`}
          onClick={() =>
            setShowMenuLinks(
              (previous) =>
                !previous
            )
          }
          aria-label="Open navigation menu"
          aria-expanded={
            showMenuLinks
          }
        >
          {showMenuLinks ? (
            <MdClose size={25} />
          ) : (
            <MdMenu size={25} />
          )}
        </button>

      </div>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {showMenuLinks && (
        <div
          ref={menuRef}
          className="navbar__mobile-menu"
        >

          <div className="navbar__mobile-header">

            <div>
              <span className="navbar__mobile-eyebrow">
                GOON DRIVER
              </span>

              <h3>
                Navigation
              </h3>
            </div>

            <span className="navbar__mobile-online">
              <span />
              Online
            </span>

          </div>


          <div className="navbar__mobile-divider" />


          <button
            className="navbar__mobile-create"
            onClick={() =>
              navigate(
                "/create-ride"
              )
            }
          >
            <MdDirectionsCar size={21} />

            <span>
              <strong>
                Post a new ride
              </strong>

              <small>
                Create and publish a ride
              </small>
            </span>
          </button>


          <div className="navbar__mobile-links">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar__mobile-link ${
                    isActive(item.path)
                      ? "navbar__mobile-link--active"
                      : ""
                  }`}
                >
                  <span className="navbar__mobile-link-icon">
                    <Icon size={19} />
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}

          </div>


          <div className="navbar__mobile-divider" />


          <button
            className="navbar__mobile-settings"
            onClick={() =>
              navigate(
                "/profile-settings"
              )
            }
          >
            <MdSettings size={19} />

            Account settings
          </button>


          <button
            className="navbar__mobile-logout"
            onClick={logout}
          >
            <MdLogout size={19} />

            Sign out
          </button>

        </div>
      )}

    </nav>
  );
};

export default Navbar;