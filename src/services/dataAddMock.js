import { getFirestore, doc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";


const transactions = [
  {"date":"2023-10-19","debit":0,"credit":4667.00,"remarks":"Loan From Anjana"},
  {"date":"2023-10-19","debit":0,"credit":4667.00,"remarks":"Loan From Sandeep"},
  {"date":"2023-10-19","debit":0,"credit":4667.00,"remarks":"Loan From Vishnuprakash P"},
  {"date":"2023-10-19","debit":14000.00,"credit":0,"remarks":"Srvc & Company"},

  {"date":"2023-10-31","debit":353.50,"credit":0,"remarks":"Food expense"},
  {"date":"2023-10-31","debit":150.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-10-31","debit":8650.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-10-31","debit":391.50,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-10-31","debit":0,"credit":9545.00,"remarks":"Loan From Sandeep"},

  {"date":"2023-10-31","debit":353.50,"credit":0,"remarks":"Food expense"},
  {"date":"2023-10-31","debit":150.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-10-31","debit":8650.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-10-31","debit":391.50,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-10-31","debit":0,"credit":9545.00,"remarks":"Loan From Anjana"},

  {"date":"2023-10-31","debit":4720.00,"credit":0,"remarks":"Software Expense"},
  {"date":"2023-10-31","debit":0,"credit":2360.00,"remarks":"Loan From Anjana"},
  {"date":"2023-10-31","debit":0,"credit":2360.00,"remarks":"Loan From Sandeep"},

  {"date":"2023-11-30","debit":3688.50,"credit":0,"remarks":"Amenities expense"},
  {"date":"2023-11-30","debit":140.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2023-11-30","debit":752.04,"credit":0,"remarks":"Entertainment expense"},
  {"date":"2023-11-30","debit":5430.00,"credit":0,"remarks":"Food expense"},
  {"date":"2023-11-30","debit":1890.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-11-30","debit":125.00,"credit":0,"remarks":"Hardware expense"},
  {"date":"2023-11-30","debit":104.50,"credit":0,"remarks":"Internet expense"},
  {"date":"2023-11-30","debit":170.00,"credit":0,"remarks":"Medical expense"},
  {"date":"2023-11-30","debit":1250.50,"credit":0,"remarks":"Outsource expense"},
  {"date":"2023-11-30","debit":278.50,"credit":0,"remarks":"Parcels/Courier expense"},
  {"date":"2023-11-30","debit":1250.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-11-30","debit":34.50,"credit":0,"remarks":"Software Expense"},
  {"date":"2023-11-30","debit":1288.45,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-11-30","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2023-11-30","debit":0,"credit":16451.99,"remarks":"Loan From Anjana"},

  {"date":"2023-11-30","debit":3688.50,"credit":0,"remarks":"Amenities expense"},
  {"date":"2023-11-30","debit":140.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2023-11-30","debit":752.04,"credit":0,"remarks":"Entertainment expense"},
  {"date":"2023-11-30","debit":5430.00,"credit":0,"remarks":"Food expense"},
  {"date":"2023-11-30","debit":1890.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-11-30","debit":125.00,"credit":0,"remarks":"Hardware expense"},
  {"date":"2023-11-30","debit":104.50,"credit":0,"remarks":"Internet expense"},
  {"date":"2023-11-30","debit":170.00,"credit":0,"remarks":"Medical expense"},
  {"date":"2023-11-30","debit":1250.50,"credit":0,"remarks":"Outsource expense"},
  {"date":"2023-11-30","debit":278.50,"credit":0,"remarks":"Parcels/Courier expense"},
  {"date":"2023-11-30","debit":1250.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-11-30","debit":34.50,"credit":0,"remarks":"Software Expense"},
  {"date":"2023-11-30","debit":1288.45,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-11-30","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2023-11-30","debit":0,"credit":16451.99,"remarks":"Loan From Sandeep"},

  {"date":"2023-12-31","debit":200.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2023-12-31","debit":4381.00,"credit":0,"remarks":"Food expense"},
  {"date":"2023-12-31","debit":655.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-12-31","debit":1232.00,"credit":0,"remarks":"Grocery expense"},
  {"date":"2023-12-31","debit":340.00,"credit":0,"remarks":"Grooming expense"},
  {"date":"2023-12-31","debit":840.00,"credit":0,"remarks":"Marketing expense"},
  {"date":"2023-12-31","debit":84.00,"credit":0,"remarks":"Medical expense"},
  {"date":"2023-12-31","debit":25.00,"credit":0,"remarks":"Operations expense"},
  {"date":"2023-12-31","debit":250.00,"credit":0,"remarks":"Outsource expense"},
  {"date":"2023-12-31","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-12-31","debit":3302.40,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-12-31","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2023-12-31","debit":0,"credit":15109.40,"remarks":"Loan From Anjana"},

  {"date":"2023-12-31","debit":200.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2023-12-31","debit":4381.00,"credit":0,"remarks":"Food expense"},
  {"date":"2023-12-31","debit":655.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2023-12-31","debit":1232.00,"credit":0,"remarks":"Grocery expense"},
  {"date":"2023-12-31","debit":340.00,"credit":0,"remarks":"Grooming expense"},
  {"date":"2023-12-31","debit":840.00,"credit":0,"remarks":"Marketing expense"},
  {"date":"2023-12-31","debit":84.00,"credit":0,"remarks":"Medical expense"},
  {"date":"2023-12-31","debit":25.00,"credit":0,"remarks":"Operations expense"},
  {"date":"2023-12-31","debit":250.00,"credit":0,"remarks":"Outsource expense"},
  {"date":"2023-12-31","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2023-12-31","debit":3302.40,"credit":0,"remarks":"Travel expense"},
  {"date":"2023-12-31","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2023-12-31","debit":0,"credit":15109.40,"remarks":"Loan From Sandeep"},

  {"date":"2024-01-09","debit":26000.00,"credit":0,"remarks":"HDFC BANK"},
  {"date":"2024-01-09","debit":0,"credit":26000.00,"remarks":"Vishnu Capital A/c"},

  {"date":"2024-01-09","debit":12000.00,"credit":0,"remarks":"HDFC BANK"},
  {"date":"2024-01-09","debit":0,"credit":12000.00,"remarks":"Anjana Capital A/c"},

  {"date":"2024-01-09","debit":12000.00,"credit":0,"remarks":"HDFC BANK"},
  {"date":"2024-01-09","debit":0,"credit":12000.00,"remarks":"Sandeep Capital A/c"},

  {"date":"2024-01-18","debit":150.00,"credit":0,"remarks":"BANK CHARGES"},
  {"date":"2024-01-18","debit":13.50,"credit":0,"remarks":"Input Cgst 9%"},
  {"date":"2024-01-18","debit":13.50,"credit":0,"remarks":"Input Sgst 9%"},
  {"date":"2024-01-18","debit":0,"credit":177.00,"remarks":"HDFC BANK"},

  {"date":"2024-01-18","debit":250.00,"credit":0,"remarks":"BANK CHARGES"},
  {"date":"2024-01-18","debit":22.50,"credit":0,"remarks":"Input Cgst 9%"},
  {"date":"2024-01-18","debit":22.50,"credit":0,"remarks":"Input Sgst 9%"},
  {"date":"2024-01-18","debit":0,"credit":295.00,"remarks":"HDFC BANK"},

  {"date":"2024-01-31","debit":2563.50,"credit":0,"remarks":"Accommodation expense"},
  {"date":"2024-01-31","debit":550.00,"credit":0,"remarks":"Amenities expense"},
  {"date":"2024-01-31","debit":825.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2024-01-31","debit":215.00,"credit":0,"remarks":"Documentation expense"},
  {"date":"2024-01-31","debit":7144.72,"credit":0,"remarks":"Food expense"},
  {"date":"2024-01-31","debit":2040.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2024-01-31","debit":3331.00,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-01-31","debit":120.00,"credit":0,"remarks":"Grooming expense"},
  {"date":"2024-01-31","debit":492.00,"credit":0,"remarks":"Hardware expense"},
  {"date":"2024-01-31","debit":500.00,"credit":0,"remarks":"Internet expense"},
  {"date":"2024-01-31","debit":126.33,"credit":0,"remarks":"Medical expense"},
  {"date":"2024-01-31","debit":500.00,"credit":0,"remarks":"Operations expense"},
  {"date":"2024-01-31","debit":237.50,"credit":0,"remarks":"Refreshment expense"},
  {"date":"2024-01-31","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2024-01-31","debit":4558.94,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-01-31","debit":200.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-01-31","debit":0,"credit":27153.99,"remarks":"Loan From Anjana"},

  {"date":"2024-01-31","debit":2563.50,"credit":0,"remarks":"Accommodation expense"},
  {"date":"2024-01-31","debit":550.00,"credit":0,"remarks":"Amenities expense"},
  {"date":"2024-01-31","debit":825.00,"credit":0,"remarks":"Automobile expense"},
  {"date":"2024-01-31","debit":215.00,"credit":0,"remarks":"Documentation expense"},
  {"date":"2024-01-31","debit":7144.72,"credit":0,"remarks":"Food expense"},
  {"date":"2024-01-31","debit":2040.00,"credit":0,"remarks":"Fuel expense"},
  {"date":"2024-01-31","debit":3331.00,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-01-31","debit":120.00,"credit":0,"remarks":"Grooming expense"},
  {"date":"2024-01-31","debit":492.00,"credit":0,"remarks":"Hardware expense"},
  {"date":"2024-01-31","debit":500.00,"credit":0,"remarks":"Internet expense"},
  {"date":"2024-01-31","debit":126.33,"credit":0,"remarks":"Medical expense"},
  {"date":"2024-01-31","debit":500.00,"credit":0,"remarks":"Operations expense"},
  {"date":"2024-01-31","debit":237.50,"credit":0,"remarks":"Refreshment expense"},
  {"date":"2024-01-31","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2024-01-31","debit":4558.94,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-01-31","debit":200.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-01-31","debit":0,"credit":27153.99,"remarks":"Loan From Sandeep"},

  {"date":"2024-02-22","debit":13656.00,"credit":0,"remarks":"Gst Paid"},
  {"date":"2024-02-22","debit":0,"credit":13656.00,"remarks":"HDFC BANK"},

  {"date":"2024-02-28","debit":230.00,"credit":0,"remarks":"Company Infra expense"},
  {"date":"2024-02-28","debit":6704.96,"credit":0,"remarks":"Food expense"},
  {"date":"2024-02-28","debit":1359.50,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-02-28","debit":263.00,"credit":0,"remarks":"Company Infra expense (additional)"},
  {"date":"2024-02-28","debit":506.50,"credit":0,"remarks":"Medical expense"},
  {"date":"2024-02-28","debit":1030.00,"credit":0,"remarks":"Petrol expense"},
  {"date":"2024-02-28","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2024-02-28","debit":2029.00,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-02-28","debit":75.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-02-28","debit":0,"credit":15947.96,"remarks":"Loan From Anjana"},

  {"date":"2024-02-28","debit":230.00,"credit":0,"remarks":"Company Infra expense"},
  {"date":"2024-02-28","debit":6704.96,"credit":0,"remarks":"Food expense"},
  {"date":"2024-02-28","debit":1359.50,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-02-28","debit":263.00,"credit":0,"remarks":"Company Infra expense (additional)"},
  {"date":"2024-02-28","debit":506.50,"credit":0,"remarks":"Medical expense"},
  {"date":"2024-02-28","debit":1030.00,"credit":0,"remarks":"Petrol expense"},
  {"date":"2024-02-28","debit":3750.00,"credit":0,"remarks":"Rent expense"},
  {"date":"2024-02-28","debit":2029.00,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-02-28","debit":75.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-02-28","debit":0,"credit":15947.96,"remarks":"Loan From Sandeep"},

  {"date":"2024-03-23","debit":22500.00,"credit":0,"remarks":"Incorporation Fees"},
  {"date":"2024-03-23","debit":2475.00,"credit":0,"remarks":"Input Cgst 9%"},
  {"date":"2024-03-23","debit":2475.00,"credit":0,"remarks":"Input Sgst 9%"},
  {"date":"2024-03-23","debit":0,"credit":32450.00,"remarks":"Srvc & Company"},
  {"date":"2024-03-23","debit":5000.00,"credit":0,"remarks":"DPIIT Fees"},

  {"date":"2024-03-31","debit":313.94,"credit":0,"remarks":"Entertainment expense"},
  {"date":"2024-03-31","debit":7946.50,"credit":0,"remarks":"Food expense"},
  {"date":"2024-03-31","debit":658.50,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-03-31","debit":4537.50,"credit":0,"remarks":"Company Infra expense"},
  {"date":"2024-03-31","debit":6692.32,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-03-31","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-03-31","debit":0,"credit":20198.76,"remarks":"Loan From Anjana"},

  {"date":"2024-03-31","debit":313.94,"credit":0,"remarks":"Entertainment expense"},
  {"date":"2024-03-31","debit":7946.50,"credit":0,"remarks":"Food expense"},
  {"date":"2024-03-31","debit":658.50,"credit":0,"remarks":"Grocery expense"},
  {"date":"2024-03-31","debit":4537.50,"credit":0,"remarks":"Company Infra expense"},
  {"date":"2024-03-31","debit":6692.32,"credit":0,"remarks":"Travel expense"},
  {"date":"2024-03-31","debit":50.00,"credit":0,"remarks":"Water expense"},
  {"date":"2024-03-31","debit":0,"credit":20198.76,"remarks":"Loan From Sandeep"},

  {"date":"2024-03-31","debit":15000.00,"credit":0,"remarks":"Audit Fee"},
  {"date":"2024-03-31","debit":0,"credit":15000.00,"remarks":"Audit Fees Payable"}
]




// --- Upload function ---
const userId = "bSCq8jxRMKaUuBAFirmUFjN2qGh1";

// --- Upload function ---
export async function uploadTransactions() {
  // helper delay function
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (const tx of transactions) {
    const isExpense = tx.debit > 0;
    const amount = isExpense ? tx.debit : tx.credit;
    const collectionPath = isExpense
      ? `/userData/${userId}/finances/financialData/expenses`
      : `/userData/${userId}/finances/financialData/revenue`;

    try {
      await addDoc(collection(db, collectionPath), {
        createdAt: new Date(),
        amount: amount,
        date: tx.date,
        remarks: tx.remarks
      });

      console.log(
        `✅ Added ${isExpense ? "expense" : "revenue"}: ${tx.remarks} (₹${amount})`
      );
    } catch (err) {
      console.error(`❌ Failed to upload ${tx.remarks}:`, err);
    }

    // Wait for 2 seconds before next upload
    await delay(4000);
  }

  console.log("🎯 Upload complete!");
}



// --- Run upload ---
