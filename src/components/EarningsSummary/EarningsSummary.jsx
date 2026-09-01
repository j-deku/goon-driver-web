import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./EarningsSummary.css";
import { useSelector } from "react-redux";
import { selectIsDriverAuthenticated } from "../../features/driver/driverSlice";
import axiosInstanceDriver from "../../../axiosInstanceDriver";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EarningsSummary = () => {
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsDriverAuthenticated);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceDriver.get("/api/driver/earnings", {
        withCredentials: true,
      });
      if (response.data.success) {
        setEarnings(response.data.earnings);
      } else {
       // toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error.response?.data || error.message);
      //toast.error("Failed to fetch earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEarnings();
    }
  }, [isAuthenticated]);

  // Prepare data for the chart
  const data = {
    labels: ["Today", "Week", "Month"],
    datasets: [
      {
        label: "Earnings ($)",
        data: [earnings.today, earnings.week, earnings.month],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Earnings Summary",
      },
    },
  };

  if (loading) {
    return <p>Loading earnings...</p>;
  }

  return (
    <div className="earnings-summary">
      <h2>Earnings Summary</h2>
      <div className="earnings-details">
        <p><strong>Today's Earnings:</strong> ${earnings.today?.toFixed(2)}</p>
        <p><strong>This Week's Earnings:</strong> ${earnings.week?.toFixed(2)}</p>
        <p><strong>This Month's Earnings:</strong> ${earnings.month?.toFixed(2)}</p>
      </div>
      <div className="earnings-chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default EarningsSummary;