import React, { useState } from "react";
import "./CreateRide.css";

import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Paper,
  MenuItem,
} from "@mui/material";

import {
  LocalizationProvider,
} from "@mui/x-date-pickers/LocalizationProvider";

import {
  AdapterDateFns,
} from "@mui/x-date-pickers/AdapterDateFns";

import {
  DatePicker,
} from "@mui/x-date-pickers/DatePicker";

import {
  TimePicker,
} from "@mui/x-date-pickers/TimePicker";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import GooglePlaceInput from "../../components/GooglePlaceInput/GooglePlaceInput";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { UseCommissionRate } from "../../hooks/UseCommissionRate/UseCommissionRate";
import { Helmet } from "react-helmet-async";


const initialState = {
  pickup: null,
  destination: null,

  price: "",
  currency: "GHS",

  description: "",

  selectedDate: null,
  selectedTime: null,

  capacity: 1,
  maxPassengers: 1,

  image: null,

  type: "",
};


export default function CreateRide() {
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [data, setData] = useState({
    ...initialState,
  });

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [createdRide, setCreatedRide] = useState(null);


  const {
    rate: commissionRate,
    loading: commissionLoading,
  } = UseCommissionRate();


  /*
   * ---------------------------------------------------------
   * Generic field change handler
   * ---------------------------------------------------------
   */
  const handleChange = (field) => (e) => {

    const value = e.target
      ? (
        e.target.type === "file"
          ? e.target.files[0]
          : e.target.value
      )
      : e;

    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  /*
   * ---------------------------------------------------------
   * Google Place selection
   * ---------------------------------------------------------
   */
  const handlePlace = (field) => (place) => {

    setData((prev) => ({
      ...prev,
      [field]: place,
    }));
  };


  /*
   * ---------------------------------------------------------
   * Validate form
   * ---------------------------------------------------------
   */
  const validate = () => {

    const {
      pickup,
      destination,
      price,
      selectedDate,
      selectedTime,
      capacity,
      maxPassengers,
      type,
      image,
      description,
    } = data;


    if (
      !pickup ||
      !destination ||
      !price ||
      !selectedDate ||
      !selectedTime ||
      !type ||
      !image ||
      !description.trim()
    ) {

      toast.error(
        "Please complete all required fields."
      );

      return false;
    }


    /*
     * The GooglePlaceInput should return a selected
     * Google place containing formattedAddress or label.
     */
    const pickupAddress =
      pickup.formattedAddress ||
      pickup.label ||
      pickup.address ||
      "";

    const destinationAddress =
      destination.formattedAddress ||
      destination.label ||
      destination.address ||
      "";


    if (
      !pickupAddress.trim() ||
      !destinationAddress.trim()
    ) {

      toast.error(
        "Please select pickup and destination from the suggestions."
      );

      return false;
    }


    if (Number(price) <= 0) {

      toast.error(
        "Price must be greater than zero."
      );

      return false;
    }


    if (Number(capacity) < 1) {

      toast.error(
        "Capacity must be at least 1."
      );

      return false;
    }


    if (Number(maxPassengers) < 1) {

      toast.error(
        "Maximum passengers must be at least 1."
      );

      return false;
    }


    if (
      Number(maxPassengers) >
      Number(capacity)
    ) {

      toast.error(
        "Maximum passengers cannot exceed capacity."
      );

      return false;
    }


    return true;
  };


  /*
   * ---------------------------------------------------------
   * Submit ride
   * ---------------------------------------------------------
   */
  const submit = async (e) => {

    e.preventDefault();


    if (!validate()) {
      return;
    }


    const formData = new FormData();


    /*
     * -----------------------------------------------------
     * Prepare pickup
     * -----------------------------------------------------
     */
    const pickup = {

      address:
        data.pickup.formattedAddress ||
        data.pickup.label ||
        data.pickup.address ||
        "",

      placeId:
        data.pickup.placeId ||
        "",

      latitude:
        data.pickup.latitude ??
        null,

      longitude:
        data.pickup.longitude ??
        null,
    };


    /*
     * -----------------------------------------------------
     * Prepare destination
     * -----------------------------------------------------
     */
    const destination = {

      address:
        data.destination.formattedAddress ||
        data.destination.label ||
        data.destination.address ||
        "",

      placeId:
        data.destination.placeId ||
        "",

      latitude:
        data.destination.latitude ??
        null,

      longitude:
        data.destination.longitude ??
        null,
    };


    /*
     * -----------------------------------------------------
     * Multipart form data
     * -----------------------------------------------------
     */
    formData.append(
      "pickup",
      JSON.stringify(pickup)
    );

    formData.append(
      "destination",
      JSON.stringify(destination)
    );

    formData.append(
      "price",
      String(data.price)
    );

    formData.append(
      "capacity",
      String(data.capacity)
    );

    formData.append(
      "maxPassengers",
      String(data.maxPassengers)
    );

    formData.append(
      "type",
      data.type
    );

    formData.append(
      "description",
      data.description
    );

    formData.append(
      "currency",
      data.currency
    );


    if (data.image) {

      formData.append(
        "image",
        data.image,
        data.image.name
      );
    }


    formData.append(
      "selectedDate",
      data.selectedDate
        .toISOString()
        .split("T")[0]
    );

    formData.append(
      "selectedTime",
      data.selectedTime
        .toTimeString()
        .slice(0, 5)
    );


    setLoading(true);


    try {

      const { data: response } =
        await axiosInstanceDriver.post(
          "/api/driver/add",
          formData,
          {
            withCredentials: true,

            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


      /*
       * -----------------------------------------------------
       * Successful creation
       * -----------------------------------------------------
       */
      if (response.success) {

        setCreatedRide(
          response.ride
        );

        setShowModal(true);

        toast.success(
          "Ride created successfully."
        );

      } else {

        toast.error(
          response.message ||
          "Unable to create ride."
        );
      }


    } catch (err) {

      console.error(
        "Create ride error:",
        err
      );


      const message =
        err?.response?.data?.message ||
        "Error adding ride.";


      toast.error(message);


    } finally {

      setLoading(false);
    }
  };


  /*
   * ---------------------------------------------------------
   * Close success modal
   * ---------------------------------------------------------
   */
  const closeModal = () => {

    setShowModal(false);

    setCreatedRide(null);

    setData({
      ...initialState,
    });
  };


  /*
   * ---------------------------------------------------------
   * Safely extract location address
   *
   * Backend returns:
   *
   * {
   *   address,
   *   latitude,
   *   longitude,
   *   placeId
   * }
   *
   * Never render the entire object directly.
   * ---------------------------------------------------------
   */
  const getLocationAddress = (location) => {

    if (!location) {
      return "—";
    }


    if (typeof location === "string") {
      return location;
    }


    return (
      location.address ||
      location.formattedAddress ||
      location.label ||
      "—"
    );
  };


  /*
   * ---------------------------------------------------------
   * Safely format price
   * ---------------------------------------------------------
   */
  const formatPrice = (price) => {

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      )
    ) {
      return "0.00";
    }


    return numericPrice.toFixed(2);
  };


  return (
    <>
      <Helmet>
        <title>
          Create Ride - TOLI-Driver
        </title>
      </Helmet>


      <Box
        p={4}
        maxWidth={700}
        mx="auto"
        mt={10}
      >

        <Typography
          variant="h4"
          mb={3}
          align="center"
        >
          Create a New Ride
        </Typography>


        <Paper
          elevation={3}
          sx={{ p: 3 }}
          component="form"
          onSubmit={submit}
        >

          <Grid
            container
            spacing={2}
          >


            {/* -------------------------------------------------
                Pickup
            -------------------------------------------------- */}

            <Grid item xs={12}>

              <Typography
                variant="subtitle2"
              >
               
              </Typography>


              <GooglePlaceInput
                label="Pickup Location"
                placeholder="Enter pickup location..."
                value={data.pickup}
                onChange={handlePlace("pickup")}
                required
              />

            </Grid>


            {/* -------------------------------------------------
                Destination
            -------------------------------------------------- */}

            <Grid item xs={12}>

              <Typography
                variant="subtitle2"
              >
                
              </Typography>


              <GooglePlaceInput
                label="Destination"
                placeholder="Enter destination..."
                value={data.destination}
                onChange={handlePlace("destination")}
                required
              />

            </Grid>


            {/* -------------------------------------------------
                Price
            -------------------------------------------------- */}

            <Grid item xs={4}>

              <TextField
                label="Price"
                type="number"
                fullWidth
                value={data.price}
                onChange={handleChange("price")}
                required
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
              />

            </Grid>


            {/* -------------------------------------------------
                Capacity
            -------------------------------------------------- */}

            <Grid item xs={4}>

              <TextField
                label="Total Capacity"
                type="number"
                fullWidth
                value={data.capacity}
                onChange={handleChange("capacity")}
                required
                inputProps={{
                  min: 1,
                }}
              />

            </Grid>


            {/* -------------------------------------------------
                Maximum passengers
            -------------------------------------------------- */}

            <Grid item xs={4}>

              <TextField
                label="Max Passengers"
                type="number"
                fullWidth
                value={data.maxPassengers}
                onChange={handleChange(
                  "maxPassengers"
                )}
                required
                inputProps={{
                  min: 1,
                  max: data.capacity,
                }}
              />

            </Grid>


            {/* -------------------------------------------------
                Commission / payout
            -------------------------------------------------- */}

            <Grid
              item
              xs={12}
              md={6}
            >

              {commissionLoading ? (

                <CircularProgress
                  size={24}
                />

              ) : (

                <TextField
                  label="Your Payout"
                  fullWidth
                  value={
                    data.price
                      ? (
                        Number(data.price) *
                        (1 - commissionRate)
                      ).toFixed(2)
                      : "0.00"
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />

              )}


              <Typography
                variant="caption"
                color="textSecondary"
                mt={1}
              >
                The commission rate is{" "}

                {commissionRate
                  ? (
                    commissionRate * 100
                  ).toFixed(2) + "%"
                  : "loading..."}.

              </Typography>

            </Grid>


            {/* -------------------------------------------------
                Description
            -------------------------------------------------- */}

            <Grid
              item
              xs={12}
              md={6}
            >

              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={data.description}
                onChange={handleChange(
                  "description"
                )}
                required
              />

            </Grid>


            {/* -------------------------------------------------
                Ride type
            -------------------------------------------------- */}

            <Grid
              item
              xs={12}
              md={4}
            >

              <TextField
                select
                label="Type"
                fullWidth
                value={data.type}
                onChange={handleChange(
                  "type"
                )}
                required
              >

                <MenuItem value="bus">
                  Bus
                </MenuItem>

                <MenuItem value="car">
                  Car
                </MenuItem>

                <MenuItem value="motorcycle">
                  Motorcycle
                </MenuItem>

              </TextField>

            </Grid>


            {/* -------------------------------------------------
                Date
            -------------------------------------------------- */}

            <Grid
              item
              xs={6}
              md={4}
            >

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
              >

                <DatePicker
                  label="Date"
                  value={data.selectedDate}
                  onChange={(date) =>
                    setData((prev) => ({
                      ...prev,
                      selectedDate: date,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                    />
                  )}
                />

              </LocalizationProvider>

            </Grid>


            {/* -------------------------------------------------
                Time
            -------------------------------------------------- */}

            <Grid
              item
              xs={6}
              md={4}
            >

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
              >

                <TimePicker
                  label="Time"
                  value={data.selectedTime}
                  onChange={(time) =>
                    setData((prev) => ({
                      ...prev,
                      selectedTime: time,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                    />
                  )}
                />

              </LocalizationProvider>

            </Grid>


            {/* -------------------------------------------------
                Image upload
            -------------------------------------------------- */}

            <Grid item xs={12}>

              <Button
                variant="outlined"
                component="label"
              >

                Upload Image

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                  onChange={handleChange(
                    "image"
                  )}
                  required
                />

              </Button>


              {data.image && (

                <Typography
                  component="span"
                  ml={2}
                >
                  {data.image.name}
                </Typography>

              )}

            </Grid>


            {/* -------------------------------------------------
                Submit
            -------------------------------------------------- */}

            <Grid
              item
              xs={12}
              textAlign="center"
            >

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{background:"linear-gradient(135deg, gray, rgb(0,0,0))"}}
                startIcon={
                  loading && (
                    <CircularProgress
                      size={20}
                      color="inherit"
                    />
                  )
                }
              >

                {loading
                  ? "Adding..."
                  : "Add Ride"}

              </Button>

            </Grid>

          </Grid>

        </Paper>


        {/* =====================================================
            SUCCESS MODAL
        ====================================================== */}

        <Dialog
          open={showModal}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
        >

          <DialogTitle>
            ✅ Ride Created!
          </DialogTitle>


          <DialogContent>

            {createdRide && (

              <Box>


                {/* ------------------------------------------------
                    Image
                ------------------------------------------------- */}

                {createdRide.imageUrl && (

                  <img
                      src={
                        createdRide.imageUrl?.startsWith("http")
                          ? createdRide.imageUrl
                          : `${API_BASE_URL}${createdRide.imageUrl}`
                      }
                      alt="ride"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 16,
                        display: "block",
                      }}
                      onError={(e) => {
                        console.error(
                          "Failed to load ride image:",
                          createdRide.imageUrl
                        );

                        e.currentTarget.style.display = "none";
                      }}
                    />
                )}


                {/* ------------------------------------------------
                    Pickup
                ------------------------------------------------- */}

                <Typography>
                  <strong>
                    From:
                  </strong>{" "}

                  {getLocationAddress(
                    createdRide.pickup
                  )}

                </Typography>


                {/* ------------------------------------------------
                    Destination
                ------------------------------------------------- */}

                <Typography>
                  <strong>
                    To:
                  </strong>{" "}

                  {getLocationAddress(
                    createdRide.destination
                  )}

                </Typography>


                {/* ------------------------------------------------
                    Date
                ------------------------------------------------- */}

                <Typography>

                  <strong>
                    Date:
                  </strong>{" "}

                  {createdRide.selectedDate
                    ? new Date(
                      createdRide.selectedDate
                    ).toLocaleDateString()
                    : "—"}

                </Typography>


                {/* ------------------------------------------------
                    Time
                ------------------------------------------------- */}

                <Typography>

                  <strong>
                    Time:
                  </strong>{" "}

                  {createdRide.selectedTime ||
                    "—"}

                </Typography>


                {/* ------------------------------------------------
                    Capacity
                ------------------------------------------------- */}

                <Typography>

                  <strong>
                    Capacity:
                  </strong>{" "}

                  {createdRide.capacity ??
                    "—"}

                </Typography>


                {/* ------------------------------------------------
                    Max passengers
                ------------------------------------------------- */}

                <Typography>

                  <strong>
                    Max Passengers:
                  </strong>{" "}

                  {createdRide.maxPassengers ??
                    "—"}

                </Typography>


                {/* ------------------------------------------------
                    Price
                ------------------------------------------------- */}

                <Typography>

                  <strong>
                    Price:
                  </strong>{" "}

                  {createdRide.currency ||
                    ""}{" "}

                  {formatPrice(
                    createdRide.price
                  )}

                </Typography>


                {/* ------------------------------------------------
                    Distance
                ------------------------------------------------- */}

                {createdRide.distance !==
                  undefined && (

                    <Typography>

                      <strong>
                        Distance:
                      </strong>{" "}

                      {createdRide.distance} km

                    </Typography>

                  )}


                {/* ------------------------------------------------
                    Duration
                ------------------------------------------------- */}

                {createdRide.duration && (

                  <Typography>

                    <strong>
                      Duration:
                    </strong>{" "}

                    {createdRide.duration}

                  </Typography>

                )}


                {/* ------------------------------------------------
                    Type
                ------------------------------------------------- */}

                {createdRide.type && (

                  <Typography>

                    <strong>
                      Type:
                    </strong>{" "}

                    {createdRide.type}

                  </Typography>

                )}


                {/* ------------------------------------------------
                    Status
                ------------------------------------------------- */}

                {createdRide.status && (

                  <Typography>

                    <strong>
                      Status:
                    </strong>{" "}

                    {createdRide.status}

                  </Typography>

                )}

              </Box>

            )}

          </DialogContent>


          <DialogActions>

            <Button
              onClick={closeModal}
              variant="contained"
            >
              Close
            </Button>

          </DialogActions>

        </Dialog>

      </Box>
    </>
  );
}
