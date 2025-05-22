import React, { useEffect, useState } from 'react'
import './HomePage.css'
import Navbar from '../components/Navbar'
import ExpenseTable from '../components/ExpenseTable'
import Settings from '../components/Settings'
import { fetchPreferences } from '../services/updatePreferences'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'


const HomePage = () => {
    const [settingsView, setSettingsView] = useState(false)
    const [userId, setUserId] = useState(null);
    const [preferences, setPreferences]=useState(null)
    const [triggerRefresh, setTriggerRefresh]=useState(false)
    
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          try {
            const prefs = await fetchPreferences(user.uid);
            setPreferences(prefs);
          } catch (err) {
            console.error('Error fetching preferences:', err);
          }
        } else {
          console.log('User is not logged in');
        }
      });
  
      return () => unsubscribe(); // Cleanup on unmount
    }, [triggerRefresh]);

    
    
  return (
    <>
<Navbar settingsView={settingsView} setSettingsView={setSettingsView}/>

{settingsView==1&&
<div className='settingsDiv'><Settings setTriggerRefresh={setTriggerRefresh} triggerRefresh={triggerRefresh} /></div>}

 <div style={!settingsView?{filter:'blur(0px)'}:{filter:'blur(10px)'}}>
    <div style={{marginLeft:'2%'}}>
      <div style={{marginLeft:'2%'}}>
        <h1 className='comp-name' style={{ fontWeight:'400'}}>{preferences&&preferences.cName}</h1>
        {/* <h1 style={{fontSize:'25px', fontWeight:'100'}}>Track and optimize company expenses with ease.</h1> */}
      </div>
    </div>
    <ExpenseTable preferences={preferences}/>
    </div>
    </>
  )
}

export default HomePage