import React, { useState } from "react";
import "./AddExpenseModal.css"; 
import { auth, db } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import './AddRevenueModal.css'
import Swal from "sweetalert2";

const AddRevenueModal = ({ isOpen, onClose,onExpenseAdded, serviceOptions, preferences}) => {
  if (!isOpen) return null;
  console.log(preferences);
  

  const [revenueDetails, setRevenueDetails]=useState({date:"",service:"",amount:"",remarks:""})
  console.log(revenueDetails);
  
  const closeModal=()=>{
    setRevenueDetails({date:"",service:"",amount:"",remarks:""})
    onClose()
  }

  const user=auth.currentUser;
  const userId=user?user.uid:null
  const addRevenue=async(event)=>{
    event.preventDefault();

    if(!userId){
      alert("Error!!! Login to continue")
      return;
    }

    const {date,service,amount,remarks}=revenueDetails

    if (!date || !amount ) {
      alert("Fill the form completely");
      return;
    }
const financeId='financialData'
    try{
  const revenueRef = collection(db, "userData", userId, "finances", financeId, "revenue");    
      await addDoc(revenueRef,{
        userID:user.uid,
        date,
        service,
        amount,
        remarks,
        createdAt: new Date(),
      });
      onClose()
      Swal.fire({
              icon: 'success',
              title: '✔️ Revenue Added!',
              showConfirmButton: false,
              timer: 800,
            });
      onExpenseAdded()
    }catch(error){
      console.log("Error while adding revenue",error);
      alert("Failed to add response")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Revenue</h2>
        <form className="revenue-form">
          <input onChange={(e)=>setRevenueDetails({...revenueDetails,date:e.target.value})} type="date" className="input-field" />

          <select onChange={(e)=>setRevenueDetails({...revenueDetails,service:e.target.value})} className="input-field">
          <option default selected disabled>Select Service</option>
              {preferences &&
              preferences.fields.Service.map((options) => (
                            <option key={options} value={options}>
                              {options}
                            </option>
                          ))}
          </select>


          <input onChange={(e)=>setRevenueDetails({...revenueDetails,amount:e.target.value})} type="number" placeholder="Amount" className="input-field" />
          <input onChange={(e)=>setRevenueDetails({...revenueDetails,remarks:e.target.value})} type="text" placeholder="Remarks" className="input-field" />

          <div className="button-container">
            <button type="button" className="cancel-button" onClick={closeModal}>
              Cancel
            </button>
            <button className="add-button" onClick={addRevenue}>
              Add Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRevenueModal;
