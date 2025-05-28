import React, { useState } from 'react'
import './addExpense.css'
import revenueImg from '../assets/revenue.png'
import addexp from '../assets/addexp.png'
import AddExpenseModal from './AddExpenseModal';
import AddRevenueModal from './AddRevenueModal';

const AddExpense = ({onExpenseAdded, preferences}) => {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);

  return (
    <>
    <div style={{display:'flex',flexDirection:'column'}}>
      <div className='addExp'>
      <button className='add' onClick={() => setExpenseModalOpen(true)} > <img style={{width:'20px'}} src={addexp} alt="" /> Add New Expense</button>
      <button className='add' onClick={() => setRevenueModalOpen(true)} > <img style={{width:'20px'}} src={revenueImg} alt="" /> Add New Revenue</button>
      </div>
      <AddExpenseModal onExpenseAdded={onExpenseAdded} isOpen={expenseModalOpen} preferences={preferences} onClose={() => setExpenseModalOpen(false)} />
      <AddRevenueModal onExpenseAdded={onExpenseAdded} isOpen={revenueModalOpen} preferences={preferences}  onClose={() => setRevenueModalOpen(false)}/>
    </div>
    </>
  )
}

export default AddExpense