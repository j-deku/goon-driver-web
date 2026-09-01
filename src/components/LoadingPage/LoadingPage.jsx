import React from 'react'
import './LoadingPage.css'
import { Link } from 'react-router-dom'
import LoadingDots from '../LoadingDot/LoadingDots'
const LoadingPage = () => {
  return (
    <div className='loadingPage'>
      <img src="/GN-logo.png" alt="Logo" />
      <div className='loading-text'>
        <LoadingDots
        dotColor="#1d4ed8"
        dotSize={14}
        dotSpacing={10}
        animationDuration={1.2}
        ariaLabel="Content is loading"
      />
      </div>
      <div className="footer-details">
        <p> &copy; Inc. J-Deku <br /><Link to={'https://github.com/j-deku/jerryDek.github.io'} target='_blank'><img  src="/to_do_icon2.png" alt="" /> </Link></p> 
      </div>
    </div>
  )
}

export default LoadingPage
