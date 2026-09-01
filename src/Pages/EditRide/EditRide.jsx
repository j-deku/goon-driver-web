import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import "./EditRide.css";
import { UseCommissionRate } from "../../hooks/UseCommissionRate/UseCommissionRate";
import { Helmet } from "react-helmet-async";

const vehicleTypes = [
  { value: "bus", label: "Bus" },
  { value: "car", label: "Van" },
  { value: "motorcycle", label: "Motor" },
];

const rideStatuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const currencyOptions = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "CFA", label: "CFA franc" },
  { code: "GHC", label: "Ghana Cedi" },
  { code: "GBP", label: "British Pound" },
  { code: "NGN", label: "Nigerian Naira" },
  { code: "KES", label: "Kenyan Shilling" },
];

const EditRide = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const commissionRate = UseCommissionRate();
  const loadingCommission = commissionRate === null;
  const [data, setData] = useState({
    pickup: "",
    destination: "",
    price: "",
    currency: "USD",
    description: "",
    selectedDate: null,
    selectedTime: null,
    passengers: 1,
    type: "",
    status: "",
    imageFile: null,
  });
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        const resp = await axiosInstanceDriver.get(
          `/api/driver/rides/${rideId}`,
          { withCredentials: true }
        );
        if (resp.data.success) {
          const r = resp.data.ride;
          setData({
            pickup: r.pickup || null,
            destination: r.destination || null,
            price: r.price ?? "",
            currency: r.currency || "USD",
            description: r.description || "",
            selectedDate: r.selectedDate
              ? new Date(r.selectedDate)
              : null,
            selectedTime: r.selectedTime
              ? new Date(`1970-01-01T${r.selectedTime}`)
              : null,
            passengers: r.maxPassengers ?? r.passengers ?? 1,
            type: r.type || "",
            status: r.status || "",
            imageFile: null,
          });
          setExistingImageUrl(r.imageUrl || "");
        } else {
          toast.error(resp.data.message || "Ride not found");
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching ride:", err);
        toast.error("Failed to load ride details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [rideId, navigate]);

 const handlePlaceChange = (val, field) => {
  if (!val) {
    setData(prev => ({
      ...prev,
      [field]: null,
    }));
    return;
  }

  setData(prev => ({
    ...prev,
    [field]: {
      ...(prev[field] || {}),
      address: val.label,
      placeId: val.value?.place_id ?? prev[field]?.placeId ?? null,
    },
  }));
};

  const handleChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setData(prev => ({ ...prev, imageFile: file }));
  };

  const validateForm = () => {
    const {
      pickup,
      destination,
      price,
      currency,
      description,
      selectedDate,
      selectedTime,
      type,
      status,
    } = data;
    if (
      !pickup ||
      !destination ||
      !price ||
      !currency ||
      !description ||
      !selectedDate ||
      !selectedTime ||
      !type ||
      !status
    ) {
      toast.error("All fields must be filled");
      return false;
    }
    return true;
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
        formData.append(
          "pickup",
          JSON.stringify(data.pickup)
        );

        formData.append(
          "destination",
          JSON.stringify(data.destination)
        );

        formData.append(
          "price",
          String(data.price)
        );

        formData.append(
          "currency",
          data.currency
        );

        formData.append(
          "description",
          data.description
        );

        formData.append(
          "type",
          data.type
        );

        formData.append(
          "status",
          data.status
        );

        formData.append(
          "maxPassengers",
          String(data.passengers)
        );

        formData.set(
          "selectedDate",
          data.selectedDate.toISOString().split("T")[0]
        );

        formData.set(
          "selectedTime",
          data.selectedTime.toTimeString().slice(0, 5)
        );

        if (data.imageFile) {
          formData.append(
            "image",
            data.imageFile,
            data.imageFile.name
          );
        }

    try {
      setLoading(true);
      const resp = await axiosInstanceDriver.put(
        `/api/driver/rides/${rideId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (resp.data.success) {
        toast.success("Ride updated successfully");
        navigate("/dashboard");
      } else {
        toast.error(resp.data.message);
      }
    } catch (err) {
      console.error("Error updating ride:", err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
        <>
        <Helmet>
          <title>Edit Ride - GoOn-Driver</title>
        </Helmet>
    <Box className="edit-ride" sx={{ maxWidth: 600, mx: "auto", mt: 18 }}>
      <Typography variant="h4" gutterBottom>
        Edit Ride
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={30}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={onSubmit} display="grid" gap={2}>
          <FormControl fullWidth>
            <Typography>Pickup Location</Typography>

            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              selectProps={{
                value: data.pickup
                  ? {
                      label: data.pickup.address || "",
                      value: {
                        place_id: data.pickup.placeId || "",
                      },
                    }
                  : null,

                onChange: val =>
                  handlePlaceChange(val, "pickup"),

                placeholder: "Enter pickup location",
              }}
            />
          </FormControl>

          <FormControl fullWidth>
              <Typography>Destination</Typography>

              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                selectProps={{
                  value: data.destination
                    ? {
                        label: data.destination.address || "",
                        value: {
                          place_id: data.destination.placeId || "",
                        },
                      }
                    : null,

                  onChange: val =>
                    handlePlaceChange(val, "destination"),

                  placeholder: "Enter destination location",
                }}
              />
            </FormControl>

          <FormControl fullWidth>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={data.price}
              onChange={handleChange}
              required
            />
          </FormControl>
            {/* Show updated commission & payout after edits */}
            {loadingCommission
              ? <CircularProgress size={24} />
              : <>
                  <TextField
                    label="Platform Fee"
                    value={
                      data.price && !isNaN(data.price)
                        ? (data.price * commissionRate).toFixed(2)
                        : "0.00"
                    }
                    InputProps={{ readOnly: true }}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Your Payout"
                    value={
                      data.price && !isNaN(data.price)
                        ? (data.price * (1 - commissionRate)).toFixed(2)
                        : "0.00"
                    }
                    InputProps={{ readOnly: true }}
                    fullWidth
                    sx={{ mt: 1, mb: 3 }}
                  />
                </>
            }
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              name="currency"
              value={data.currency}
              onChange={handleChange}
              label="Currency"
              required
            >
              {currencyOptions.map(c => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} &ndash; {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              value={data.description}
              onChange={handleChange}
              required
            />
          </FormControl>

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={data.type}
                onChange={handleChange}
                label="Type"
                required
              >
                {vehicleTypes.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={data.status}
                onChange={handleChange}
                label="Status"
                required
              >
                {rideStatuses.map(s => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box display="flex" gap={2}>
              <DatePicker
                label="Date"
                value={data.selectedDate}
                onChange={newDate => setData(prev => ({ ...prev, selectedDate: newDate }))}
                renderInput={params => <TextField {...params} fullWidth required />}
              />
              <TimePicker
                label="Time"
                value={data.selectedTime}
                onChange={newTime => setData(prev => ({ ...prev, selectedTime: newTime }))}
                renderInput={params => <TextField {...params} fullWidth required />}
              />
            </Box>
          </LocalizationProvider>

          <FormControl fullWidth>
            <TextField
              label="Passengers"
              name="passengers"
              type="number"
              value={data.passengers}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              required
            />
          </FormControl>

          {existingImageUrl && (
            <Box>
              <Typography>Current Image</Typography>
              <Box component="img" src={existingImageUrl} width="100%" maxHeight={200} sx={{ objectFit: "cover", borderRadius: 1 }} />
            </Box>
          )}

          <FormControl>
            <Typography>Replace Image (optional)</Typography>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </FormControl>

          <Box textAlign="center" sx={{ mt: 5 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
    </>
  );
};

export default EditRide;