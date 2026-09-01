import React from 'react'
import './Support.css'
import SupportDriver from '../../components/SupportDriver/SupportDriver'
import { Helmet } from 'react-helmet-async'
const Support = () => {
  return (
        <>
        <Helmet>
          <title>Support - GoOn-Driver</title>
        </Helmet>
    <div className='support'>
    <SupportDriver/>
    </div>
    </>
  )
}

export default Support
