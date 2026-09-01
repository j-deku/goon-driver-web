import React from 'react'
import './Settings.css'
import DriverProfile from '../../components/DriverProfile/DriverProfile'
import { Helmet } from 'react-helmet-async'

const Settings = () => {
  return (
        <>
        <Helmet>
          <title>Settings - GoOn-Driver</title>
        </Helmet>
    <div className='settings'>
     <h1>Settings</h1>
      <DriverProfile/>
    </div>
    </>
  )
}

export default Settings
