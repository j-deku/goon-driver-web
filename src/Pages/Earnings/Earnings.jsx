import React from 'react'
import './Earnings.css'
import EarningReports from '../../components/EarningReports/EarningReports'
import { Helmet } from 'react-helmet-async'

const Earnings = () => {
  return (
        <>
        <Helmet>
          <title>Earnings - TOLI-Driver</title>
        </Helmet>
      <div className='earn'>
      <EarningReports/>
    </div>
    </>
  )
}

export default Earnings
