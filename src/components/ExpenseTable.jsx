import React, { useEffect, useState } from 'react'
import './expenseTable.css'
import AddExpense from './AddExpense'
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import edit from '../assets/edit.png'
import deleteImg from '../assets/delete.png'
import { Link } from 'react-router-dom'
import Swal from "sweetalert2";
import { deleteData, filterExpenses, sortExpenses } from '../services/services'
import Filters from './Filters'
import { filterExpensesByDate } from '../services/helpers'




const ExpenseTable = ({preferences }) => {

  const [expenses, setExpenses] = useState([])
  const [date,setDate]=useState({from:'',to:''})  
  const [displayExpenses, setDisplayExpenses] = useState([]) //Display data
  const [displayRevenue, setDisplayRevenue] = useState([]) // Display data

  const [revenue, setRevenue] = useState([])
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [monthlyTotalRevenue, setMonthlyTotalRevenue] = useState(0)
  const [view, setView] = useState("all")

  const [editRowId, setEditRowId] = useState(null); // stores the ID of the row being edited
  const [editRowData, setEditRowData] = useState({}); // stores editable data

  const [triggerFetch, setTriggerFetch] = useState(false);
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const generateDefaultFilters = (preferences) => {
    if (!preferences?.fields) return {};
    const filters = {};
    Object.keys(preferences.fields).forEach(key => {
      filters[key] = 'All';
    });
    return filters;
  };

  useEffect(() => {
    if (preferences?.fields) {
      setFilterValues(generateDefaultFilters(preferences));
    }
  }, [preferences]);

  useEffect(()=>{
    const ref=filterExpensesByDate(date.from,date.to, expenses)
    setDisplayExpenses(ref)
  },[date])
  const [filterValues, setFilterValues] = useState(generateDefaultFilters(preferences));


  const saveEditedData = async (type, id) => {
    const userId = auth.currentUser.uid; // assuming Firebase Auth is being used
    try {
      await updateDoc(doc(db, "users", userId, type, id), editRowData);
      setTriggerFetch((prev) => !prev);
      Swal.fire({
        icon: "success",
        title: `✔️ ${type} Updated!`,
        showConfirmButton: false,
        timer: 800
      });
      setEditRowId(null);

    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalRevenue = revenue.reduce((sum, revenue) => sum + Number(revenue.amount || 0), 0);
    setTotalExpenses(total);
    setRevenueTotal(totalRevenue)
  }, [expenses, revenue]);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const filteredData = expenses.filter(exp => {
      const [year, month] = exp.date.split("-").map(Number);
      return year === currentYear && month == currentMonth;
    })
    setMonthlyTotal(filteredData.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))

    const filteredDataRevenue = revenue.filter(rev => {
      const [year, month] = rev.date.split("-").map(Number);
      return year === currentYear && month == currentMonth;
    })
    setMonthlyTotalRevenue(filteredDataRevenue.reduce((sum, revenue) => sum + Number(revenue.amount || 0), 0))
  }, [JSON.stringify(revenue)])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setExpenses([]);
        setRevenue([]);// No user logged in
        return;
      }
      const financeId='financialData'
      const userExpensesRef = collection(db, "userData", user.uid, "finances", financeId, "expenses");
      const userRevenueRef = collection(db, "userData", user.uid, "finances", financeId, "revenue");

      const q = query(userExpensesRef, orderBy("date", "desc")); // Order By Date
      const p = query(userRevenueRef, orderBy("date", "desc")); // Order By Date

      try {
        const querySnapshot = await getDocs(q);
        const querySnapshotRevenue = await getDocs(p)
        const expensesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const revenueList = querySnapshotRevenue.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("Fetched expenses:", expensesList);
        setExpenses(expensesList);
        setDisplayExpenses(expensesList)
        // console.log("Fetched revenue:", revenueList);
        setRevenue(revenueList);
        setDisplayRevenue(revenueList)
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    });

    return () => unsubscribe();
  }, [triggerFetch]);

  const handleExpenseAdded = () => {
    setTriggerFetch((prev) => !prev);
  };

  const handleDeleteData = async (type, id) => {
    const result = await Swal.fire({
      title: `Delete this ${type}?`,
      text: `This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      try {
        await deleteData(type, id);
        Swal.fire({
          icon: 'success',
          title: `✔️ ${type} deleted!`,
          showConfirmButton: false,
          timer: 800,
        });
        setTriggerFetch((prev) => !prev);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '❌ Failed to delete',
          text: 'Something went wrong. Please try again.',
        });
        console.error(error);
      }
    }
  };
  

  useEffect(() => {
    const filtered = filterExpenses(expenses, filterValues, searchText);
    setDisplayExpenses(filtered);
  }, [expenses, filterValues, searchText]);

  useEffect(() => {
    const sorted = sortExpenses(displayExpenses, sortBy);
    setExpenses(sorted);
  }, [sortBy])




  return (
    <>
      <div className='insightButtons'>
        <table className='insight-table'>
          <tr>
            <td>Total expense of this month</td>
            <td> ₹{monthlyTotal}</td>
            <td>Total revenue generated this month</td>
            <td> ₹{monthlyTotalRevenue}</td>
          </tr>
          <tr>
            <td>Gross expenses:</td>
            <td> ₹{totalExpenses}</td>
            <td>Gross revenue</td><td> ₹{revenueTotal}</td>
          </tr>
          <tr>
            <td><Link to="/home/insights"><button> View more Insights</button></Link></td>
          </tr>
        </table>
        {/* <img src={image} alt=""  /> */}
        

      </div>

      <div className='add-exp-buttons' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><AddExpense onExpenseAdded={handleExpenseAdded} preferences={preferences} /></div>
      <div style={{ display: 'flex', alignItems: 'center', width: '100vw', justifyContent: 'center' }}>
        <h1 className='finance-report-h1' style={{ textAlign: 'center' }}>Your Financial Report</h1>
        <div >
          <label style={{ margin: '20px 5px 10px 20px' }} htmlFor="view">View </label>
          <select name="" id="view" onChange={(e) => { setView(e.target.value) }}>
            <option value='all'>All</option>
            <option value='expenses'>Expenses</option>
            <option value='revenue'>Revenue</option>
          </select>
        </div>
      </div>
      <div className='filter-container'>
        <Filters setSortBy={setSortBy} filterValues={filterValues} setFilterValues={setFilterValues} setSearchText={setSearchText} preferences={preferences}/>
      </div>
      <div className='date-picker-div'>
        <label htmlFor="from">From</label>
        <input value={date.from} className='input-picker' type="date" id='from' onChange={(e)=>setDate({...date,from:e.target.value})}/>

        <label htmlFor="to">To</label>
        <input value={date.to} className='input-picker' type="date" id='to'  onChange={(e)=>setDate({...date,to:e.target.value})}/>
        <button style={{backgroundColor:'var(--primary-color)',padding:'5px', borderRadius:'5px',color:'white',border:'solid white 0.5px'}} onClick={()=>setDate({from:'',to:''})}>Reset</button>
    </div>


      {/* \Expense table */}
<h2 className='table-head'>Expense Overview</h2>
      {(view == "all" || view == "expenses") && (
        <div className='tableDiv'>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                {preferences?.fields && Object.keys(preferences.fields).map((field) => (
                  <th key={field}>{field}</th>
                ))}
                <th>Amount</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {displayExpenses.map((expense, index) => (
    <tr key={expense.id}>
      <td>{index + 1}</td>

      {editRowId === expense.id ? (
        <>
          <td>
            <input
              className="edit-input"
              type="date"
              value={editRowData.date}
              onChange={(e) => setEditRowData({ ...editRowData, date: e.target.value })}
            />
          </td>

          {/* Dynamic Preference Fields */}
          {Object.keys(preferences.fields).map((key) => (
            <td key={key}>
              <select
                value={editRowData[key] || ""}
                onChange={(e) => setEditRowData({ ...editRowData, [key]: e.target.value })}
              >
                <option value="" disabled>Select {key}</option>
                {preferences.fields[key].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </td>
          ))}

          <td>
            <input
              className="edit-input"
              type="number"
              value={editRowData.amount}
              onChange={(e) => setEditRowData({ ...editRowData, amount: e.target.value })}
            />
          </td>
          <td>
            <input
              className="edit-input"
              type="text"
              value={editRowData.remarks}
              onChange={(e) => setEditRowData({ ...editRowData, remarks: e.target.value })}
            />
          </td>
          <td className="edit-btns">
            <button style={{backgroundColor:'green'}} className="edit-btn" onClick={() => saveEditedData("expenses", expense.id)}>
              <i style={{color:'white'}} className="fa-solid fa-check"></i>
            </button>
            <button style={{backgroundColor:'red'}}className="edit-btn" onClick={() => setEditRowId(null)}>
              <i style={{color:'white'}} className="fa-solid fa-xmark"></i>
            </button>
          </td>
        </>
      ) : (
        <>
          <td>{expense.date || "N/A"}</td>

          {/* Dynamic Preference Fields Display */}
          {preferences && Object.keys(preferences.fields).map((key) => (
            <td key={key}>{expense[key] || "N/A"}</td>
          ))}

          <td>₹{expense.amount || "0"}</td>
          <td>{expense.remarks || "N/A"}</td>
          <td className="actionCell">
            <i className="fa-solid fa-pen-to-square"
            title='Edit'
              onClick={() => {
                setEditRowId(expense.id);
                setEditRowData(expense);
              }}
              src={edit}
              alt="Edit"
            ></i>
            <i className="fa-solid fa-trash" title='Delete' onClick={() => handleDeleteData("expenses", expense.id)} src={deleteImg} alt="Delete" ></i>
          </td>
        </>
      )}
    </tr>
  ))}
</tbody>

          </table>
        </div>)}



      {/* Revenue Table */}

   <h2 className='table-head'>Revenue Overview</h2>
      {(view == "revenue" || view == "all") && (
        <div className='tableDiv'>
       
          <table>
            <thead>
              <tr>

                <th>#</th>
                <th>Date</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Remarks</th>
                <th>Actions</th>

              </tr>
            </thead>
            <tbody>
              {displayRevenue.length > 0 && displayRevenue.map((revenue, index) => (
                <tr key={revenue.id}>
                  <td>{index + 1}</td>

                  {editRowId === revenue.id ? (
                    <>
                      <td>
                        <input
                          className='edit-input'
                          type="date"
                          value={editRowData.date}
                          onChange={(e) => setEditRowData({ ...editRowData, date: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          value={editRowData.service}
                          onChange={(e) => setEditRowData({ ...editRowData, service: e.target.value })}
                        >
                          <option disabled>Select Service</option>
                          {serviceOptions.map((service) => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className='edit-input'
                          type="number"
                          value={editRowData.amount}
                          onChange={(e) => setEditRowData({ ...editRowData, amount: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className='edit-input'
                          type="text"
                          value={editRowData.remarks}
                          onChange={(e) => setEditRowData({ ...editRowData, remarks: e.target.value })}
                        />
                      </td>
                      <td className='edit-btns'>
                        <button className='edit-btn check' onClick={() => saveEditedData('revenue', revenue.id)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button className='edit-btn xmark' onClick={() => setEditRowId(null)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{revenue.date || "N/A"}</td>
                      <td>{revenue.service || "N/A"}</td>
                      <td>₹{revenue.amount || "0"}</td>
                      <td>{revenue.remarks || "N/A"}</td>
                      <td className='actionCell'>
                        <i className="fa-solid fa-pen-to-square"
                          onClick={() => {
                            setEditRowId(revenue.id);
                            setEditRowData(revenue);
                          }}
                          src={edit}
                          alt="Edit"
                        ></i>
                        <i className="fa-solid fa-trash"
                          onClick={() => handleDeleteData('revenue', revenue.id)}
                          src={deleteImg}
                          alt="Delete"
                        ></i>
                      </td>
                    
            
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </>
  )
}

export default ExpenseTable

