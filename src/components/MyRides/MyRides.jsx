import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Dialog, DialogTitle, DialogActions, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstanceDriver from "../../../axiosInstanceDriver";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstanceDriver.get("/api/driver/rides", {
        withCredentials: true,
      }); 
      setRides(
        data.rides.map((ride) => ({
          ...ride,
          time: ride.selectedTime,
        }))
      );
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRides();
    }
  }, [isAuthenticated, fetchRides]);

  const confirmDelete = id => { setRideToDelete(id); setOpenDialog(true); };
  const handleDelete = async () => {
    if (!rideToDelete) return;
    try {
      await axiosInstanceDriver.delete(`/api/driver/rides/${rideToDelete}`, {
        withCredentials: true,
      });
      setRides(prev => prev.filter(r => r.id !== rideToDelete));
    } catch (error) {
      console.error("Error deleting ride:", error);
    } finally {
      setOpenDialog(false);
      setRideToDelete(null);
    }
  };

  const columns = [
          {
        field: "route",
        headerName: "Route",
        flex: 1.5,
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              whiteSpace: "normal",
              lineHeight: 1.4,
              py: 1,
            }}
          >
            <Typography variant="body2">
              {row.pickup?.address ?? "Unknown pickup"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: "fontWeightMedium",
                color: "text.secondary",
              }}
            >
              → {row.destination?.address ?? "Unknown destination"}
            </Typography>
          </Box>
        ),
      },
    { field: "time", headerName: "Time", width: 110 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="view"
          icon={<Button onClick={() => navigate(`/ride-details/${id}`)} variant="text">View</Button>}
          label="View Details"
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigate(`/edit-ride/${id}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(id)}
          showInMenu={false}
        />
      ],
    },
  ];

  return (
    <Box sx={{ height: 300, width: '100%', mt: 4 }}>
      <DataGrid
        rows={rides}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10]}
        onPageSizeChange={setPageSize}
        pagination
        disableSelectionOnClick
        rowHeight={64}
        getRowId={(row) => row.id}
      />


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyRides;