import React from 'react'
import './History.css'
import RideHistory from '../../components/RideHistory/RideHistory'
import { Helmet } from 'react-helmet-async'

const History = () => {
  return (
        <>
        <Helmet>
          <title>History - GoOn-Driver</title>
        </Helmet>
        <div className='history'>
              <RideHistory/>
              <hr style={{marginTop:50}}/>
        </div>
    </>
  )
}

export default History