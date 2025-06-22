import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigator.css'
import img from '../assets/image.png'


const Navigator = ({preferences,companyDetails}) => {

const location=useLocation()
  return (
    <>
    <div className='navigation'>
      <div className='navigation-buttons'>
        <Link to={'/'}><button className={`default-btn ${location.pathname === '/' ? 'active' : ''}`}>Overview</button></Link>
        <Link to={'/home/insights'}><button className={`default-btn ${location.pathname === '/home/insights' ? 'active' : ''}`}>Insights</button></Link>
      </div>
      <div className='comp-div'>
        <img className='company-logo' src={companyDetails?companyDetails.logo:img} alt="" />
                <h1 className='comp-name' style={{ fontWeight:'800'}}>{preferences&&preferences.cName || "Loading..."}</h1>
      </div>
    <div></div>
    </div>
    
    </>
  )
}

export default Navigator