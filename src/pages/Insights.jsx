import './insights.css'
// import ExpenseChart from "../components/ExpenseChart";
import Navbar from '../components/Navbar';
import Charts from '../components/Charts';
import React, { useEffect, useState } from 'react'
import { fetchUserExpenses } from '../services/fetchData'
import { calculateTotalAmount, filterExpensesByDate } from '../services/helpers'
import { fetchPreferences } from '../services/updatePreferences';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import DownloadStatement from '../components/DownloadStatement';



const Insights = () => {  
      const [allExpenses, setAllExpenses]=useState([])
      const [displayExpenses, setDisplayExpenses]=useState([])
      const [insightData,setInsightData]=useState({totalExpense:''})
      const [date,setDate]=useState({from:'',to:''}) 
      const [userId, setUserId]=useState('')
      const [preferences, setPreferences]=useState(null)
      const [downloadModal,setDownloadModal]=useState(false)
  
      useEffect(()=>{
          const fetchExpenses=async()=>{
          const fetchedExpenses=await fetchUserExpenses()
          setAllExpenses(fetchedExpenses)
          setDisplayExpenses(fetchedExpenses)
      };fetchExpenses();
          
      },[])
  
      useEffect(()=>{
          const ref=filterExpensesByDate(date.from,date.to, allExpenses)
          setDisplayExpenses(ref)
        },[date])
  
      useEffect(()=>{
          const totalExpenseRef=calculateTotalAmount(displayExpenses)
          setInsightData({...insightData,totalExpense:totalExpenseRef})
      },[displayExpenses])


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
      }, []);

  return (
    <>
      <div><Navbar/></div>
      {downloadModal&&
        <div className='download-div'><DownloadStatement setDownloadModal={setDownloadModal} preferences={preferences} allExpenses={allExpenses}/></div>}
      <Link to="/"><button className='act-btn'><i className="fa-solid fa-arrow-left"></i>Back to Home</button></Link>
      <div>
      <h1 className='finance-report-h1' style={{ fontWeight:'500', textAlign:'center'}}>Financial Insights</h1>
      <div style={{display:'flex',justifyContent:'right',width:'90%'}}>{
        !downloadModal?
        <button className='download-btn' onClick={()=>setDownloadModal(!downloadModal)}>Download Statement</button>:
        <button className='download-btn' onClick={()=>setDownloadModal(!downloadModal)}>Close</button>
        }</div>
      <Charts preferences={preferences} setDate={setDate} date={date} insightData={insightData} displayExpenses={displayExpenses} setDisplayExpenses={setDisplayExpenses}/>
    </div>
    </>
  )
}

export default Insights