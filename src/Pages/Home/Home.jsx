import React from 'react'
import './Home.css'
import CurrentRideOverview from '../../components/CurrentRideOverView/CurrentRideOverview'
import EarningsSummary from '../../components/EarningsSummary/EarningsSummary'
import PerformanceMetrics from '../../components/PerformanceMetrics/PerformanceMetrics'
import Header from '../../components/Header/Header'
import CurrentRideApproved from '../../components/CurrentRideApproved/CurrentRideApproved'
import MyRides from '../../components/MyRides/MyRides'
import { Helmet } from 'react-helmet-async'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  return (
        <>
        <Helmet>
          <title>Dashboard - GoOn-Driver</title>
        </Helmet>
    <div>
      <Header/>
      <div style={{ padding: '20px', margin: '0 auto', maxWidth: '1200px' }}>
      <CurrentRideApproved/>
      <hr/>
      <MyRides/>
      <Button className='home-button'
      variant='contained'
      onClick={() => navigate("/my-bookings")}
      size='large'
      sx={{ margin: '20px auto', display: 'block', width:{xs:150, sm: 250}, p:{xs:0.9, sm:2}, fontWeight:700, borderRadius: 10, background:"linear-gradient(135deg, #b0e2e9ff, #2e9dacd8)", color:"black", "&:hover": {backgroundColor:"#0A4D68"}}}
      >
        Approved Rides</Button>
      <hr/>
      <h2 className='home-heading'>Current Ride Overview</h2>
      <CurrentRideOverview/>
      <EarningsSummary/>
      <PerformanceMetrics/>
      </div>
    </div>
    </>
  )
}

export default Home
