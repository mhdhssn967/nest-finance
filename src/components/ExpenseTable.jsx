import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./expenseTable.css";
import AddExpense from "./AddExpense";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Swal from "sweetalert2";
import { deleteData, filterExpenses, sortExpenses } from "../services/services";
import Filters from "./Filters";
import { filterExpensesByDate } from "../services/helpers";
import exp from "../assets/exp.jpg";
import tra from "../assets/tra.jpg";
import rev from "../assets/rev.jpg";
import AddExpenseModal from "./AddExpenseModal";
import AddRevenueModal from "./AddRevenueModal";
import send from "../assets/send.png";
import recieve from "../assets/recieve.png";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const ExpenseTable = ({ preferences }) => {
  const [expenses, setExpenses] = useState([]);

  const [date, setDate] = useState({ from: "", to: "" });
  const [displayExpenses, setDisplayExpenses] = useState([]); //Display data
  const [displayRevenue, setDisplayRevenue] = useState([]); // Display data
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [view, setView] = useState("all");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [filteredFinanceData, setFilteredFinanceData] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [editRowId, setEditRowId] = useState(null); // stores the ID of the row being edited
  const [editRowData, setEditRowData] = useState({}); // stores editable data
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState(0);
  const [monthlyTotalRevenue, setMonthlyTotalRevenue] = useState(0);

  const [triggerFetch, setTriggerFetch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("date");


const downloadFilteredExcel = () => {
  // Define headers for the Excel sheet
  const headers = ["#", "Date", "Amount", "Remarks","Category"];

  // Build the data rows using your source (combinedData)
  const data = combinedData.map((item, index) => [
    index + 1,
    item.date || "-",
    item.amount || 0,
    item.remarks || "-",
    item.category || "-"
  ]);

  // Combine headers and data
  const worksheetData = [headers, ...data];

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Optional: Set column widths
  worksheet["!cols"] = [
    { wch: 5 },    // #
    { wch: 15 },   // Date
    { wch: 10 },   // Amount
    { wch: 25 },   // Remarks
  ];

  // Write and download
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Filtered_Transactions.xlsx");
};


  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Jan = 0
    const currentYear = currentDate.getFullYear();

    // Calculate total expenses
    const totalExpenseMonth = expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      if (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      ) {
        return sum + Number(expense.amount);
      }
      return sum;
    }, 0);

    // Calculate total revenues
    const totalRevenueMonth = revenue.reduce((sum, revenue) => {
      const revenueDate = new Date(revenue.date);
      if (
        revenueDate.getMonth() === currentMonth &&
        revenueDate.getFullYear() === currentYear
      ) {
        return sum + Number(revenue.amount);
      }
      return sum;
    }, 0);

    // Set both totals
    setMonthlyTotalExpense(totalExpenseMonth);
    setMonthlyTotalRevenue(totalRevenueMonth);
  }, [expenses, revenue]);

  useEffect(() => {
    const totalExpenses = displayExpenses.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    );
    setTotalExpenses(totalExpenses);
    const totalRevenue = displayRevenue.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    );
    setTotalRevenue(totalRevenue);
  }, [displayExpenses, displayRevenue]);

  const monthName = new Date().toLocaleString("default", { month: "long" });
  const today = new Date();
  //Thu Jun 26 2025 15:40:48 GMT+0530 (India Standard Time)
  const currentDate = today.getDate();

  const totalDaysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const progress = ((currentDate / totalDaysInMonth) * 100).toFixed(2);

  const generateDefaultFilters = (preferences) => {
    if (!preferences?.fields) return {};
    const filters = {};
    Object.keys(preferences.fields).forEach((key) => {
      filters[key] = "All";
    });
    return filters;
  };

  useEffect(() => {
    if (preferences?.fields) {
      setFilterValues(generateDefaultFilters(preferences));
    }
  }, [preferences]);

  useEffect(() => {
    const ref = filterExpensesByDate(date.from, date.to, expenses);
    setDisplayExpenses(ref);
  }, [date]);
  const [filterValues, setFilterValues] = useState(
    generateDefaultFilters(preferences)
  );

  const saveEditedData = async (type, id) => {
    const userId = auth.currentUser.uid; // assuming Firebase Auth is being used
    try {
      const financeId = "financialData";
      await updateDoc(
        doc(db, "userData", userId, "finances", financeId, type, id),
        editRowData
      );
      setTriggerFetch((prev) => !prev);
      Swal.fire({
        icon: "success",
        title: `✔️ ${type} Updated!`,
        showConfirmButton: false,
        timer: 800,
      });
      setEditRowId(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setExpenses([]);
        setRevenue([]); // No user logged in
        return;
      }
      const financeId = "financialData";
      const userExpensesRef = collection(
        db,
        "userData",
        user.uid,
        "finances",
        financeId,
        "expenses"
      );
      const userRevenueRef = collection(
        db,
        "userData",
        user.uid,
        "finances",
        financeId,
        "revenue"
      );

      const q = query(userExpensesRef, orderBy("date", "desc")); // Order By Date
      const p = query(userRevenueRef, orderBy("date", "desc")); // Order By Date

      try {
        const querySnapshot = await getDocs(q);
        const querySnapshotRevenue = await getDocs(p);
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
        setDisplayExpenses(expensesList);
        // console.log("Fetched revenue:", revenueList);
        setRevenue(revenueList);
        setDisplayRevenue(revenueList);
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
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(type, id);
        Swal.fire({
          icon: "success",
          title: `✔️ ${type} deleted!`,
          showConfirmButton: false,
          timer: 800,
        });
        setTriggerFetch((prev) => !prev);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "❌ Failed to delete",
          text: "Something went wrong. Please try again.",
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
  }, [sortBy]);

  useEffect(() => {
    if (view == "all") {
      const combinedDataRef = [
        ...displayExpenses.map((item) => ({
          ...item,
          typeOfTransaction: "Expense",
        })),
        ...displayRevenue.map((item) => ({
          ...item,
          typeOfTransaction: "Revenue",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
    if (view == "expenses") {
      const combinedDataRef = [
        ...displayExpenses.map((item) => ({
          ...item,
          typeOfTransaction: "Expense",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
    if (view == "revenue") {
      const combinedDataRef = [
        ...displayRevenue.map((item) => ({
          ...item,
          typeOfTransaction: "Revenue",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
  }, [displayExpenses, displayRevenue, view]);

  useEffect(() => {
    if (view == "all" || view == "expenses") {
      setFilteredFinanceData(displayExpenses);
    } else {
      setFilteredFinanceData(displayRevenue);
    }
  }, [displayExpenses, displayRevenue, view]);

  const getLineChartData = () => {
    if (!displayExpenses || displayExpenses.length === 0) return [];

    const filtered = filteredFinanceData;

    const dateToAmountMap = {};

    filtered.forEach((exp) => {
      const dateKey = new Date(exp.date).toISOString().split("T")[0]; // 'YYYY-MM-DD'
      if (!dateToAmountMap[dateKey]) dateToAmountMap[dateKey] = 0;
      dateToAmountMap[dateKey] += Number(exp.amount); // ensure it's a number
    });

    const chartData = Object.entries(dateToAmountMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({
        date,
        amount: Number(amount),
      }));

    return chartData;
  };




  return (
    <>
      <div className="top-div">
        <h2>Financial Details</h2>
        <div className="date-picker-div">
          <div className="input-wrapper">
            <label htmlFor="from">From</label>
            <input
              value={date.from}
              className="input-picker"
              type="date"
              id="from"
              onChange={(e) => setDate({ ...date, from: e.target.value })}
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="to">To</label>
            <input
              value={date.to}
              className="input-picker"
              type="date"
              id="to"
              onChange={(e) => setDate({ ...date, to: e.target.value })}
            />
          </div>
          <button
            className="reset-btn"
            onClick={() => setDate({ from: "", to: "" })}
          >
            Reset
          </button>
        </div>
        <button className="excel-btn" onClick={downloadFilteredExcel}>Download Excel</button>
      </div>

      <div className="top-container">
        <div className="report-card">
          <div className="report-head">
            <img src={tra} alt="" />
            <h2>Financial Snapshot</h2>
          </div>
          <div className="reports">
            <div>
              <div className="inside-head">
                <img src={exp} alt="" />
                <h3>Total Expense</h3>
              </div>
              <div className="outside-head">
                <h2>{totalExpenses} INR</h2>
                <h5>{monthlyTotalExpense} INR this month</h5>
              </div>
            </div>
            <div>
              <div className="inside-head">
                <img src={rev} alt="" />
                <h3>Total Revenue</h3>
              </div>
              <div className="outside-head">
                <h2>{totalRevenue} INR</h2>
                <h5>{monthlyTotalRevenue} INR this month</h5>
              </div>
            </div>
          </div>
          <AddExpense
            setExpenseModalOpen={setExpenseModalOpen}
            setRevenueModalOpen={setRevenueModalOpen}
            onExpenseAdded={handleExpenseAdded}
            preferences={preferences}
          />
          <div className="expense-bar">
            <div
              className="expense-progress"
              style={{ width: `${Number(progress)}%` }}
            >
              <div>
                <p>{monthlyTotalExpense} INR</p>
                <i className="fa-solid fa-play"></i>
              </div>
            </div>
            <p className="report-month">{monthName}</p>
          </div>
        </div>
        <div>
          <div className="line-graph line-table" style={{ marginTop: "3rem" }}>
            <h3
              style={{
                color: "black",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              <p>Daily {view == "revenue" ? "Revenue" : "Expense"} over time</p>
            </h3>
            <BarChart width={800} height={300} data={getLineChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "black", fontSize: 12 }} />
              <YAxis domain={[0, 10000]} tick={{ fill: "black" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="amount"
                fill="rgb(79, 201, 31)"
                barSize={20}
                radius={[110, 110, 0, 0]} // TopLeft, TopRight, BottomRight, BottomLeft
              />
            </BarChart>
          </div>
        </div>
      </div>

      <AddExpenseModal
        onExpenseAdded={handleExpenseAdded}
        isOpen={expenseModalOpen}
        preferences={preferences}
        onClose={() => setExpenseModalOpen(false)}
      />
      <AddRevenueModal
        onExpenseAdded={handleExpenseAdded}
        isOpen={revenueModalOpen}
        preferences={preferences}
        onClose={() => setRevenueModalOpen(false)}
      />

      <div
        className="add-exp-buttons"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100vw",
          justifyContent: "center",
        }}
      ></div>

      {/* ----------------------- */}
      <div className="table-head-container">
        <div className="table-head">
          <h1 className="finance-report-h1" style={{ textAlign: "left" }}>
            Your Financial Report
          </h1>
          <div className="table-view">
            <button
              className={`view-button ${view === "all" ? "active" : ""}`}
              onClick={() => setView("all")}
            >
              All
            </button>
            <button
              className={`view-button ${view === "expenses" ? "active" : ""}`}
              onClick={() => setView("expenses")}
            >
              Expenses
            </button>
            <button
              className={`view-button ${view === "revenue" ? "active" : ""}`}
              onClick={() => setView("revenue")}
            >
              Revenue
            </button>
          </div>
        </div>
        <div className="filter-container">
          <Filters
            setSortBy={setSortBy}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            setSearchText={setSearchText}
            preferences={preferences}
          />
        </div>
      </div>
      <div className="tableDiv">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Transaction</th>
              <th>Date</th>
              {/* Dynamically render preference or service field */}
              {preferences &&
                Object.keys(preferences.fields).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              <th>Amount</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {combinedData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  {item.typeOfTransaction == "Expense"}

                  <img
                    width={"25px"}
                    src={item.typeOfTransaction == "Expense" ? send : recieve}
                    alt=""
                  />
                </td>

                {editRowId === item.id ? (
                  <>
                    <td>
                      <input
                        className="edit-input"
                        type="date"
                        value={editRowData.date}
                        onChange={(e) =>
                          setEditRowData({
                            ...editRowData,
                            date: e.target.value,
                          })
                        }
                      />
                    </td>

                    {item.typeOfTransaction ? (
                      Object.keys(preferences.fields).map((key) => (
                        <td key={key}>
                          <select
                            value={editRowData[key] || ""}
                            onChange={(e) =>
                              setEditRowData({
                                ...editRowData,
                                [key]: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select {key}
                            </option>
                            {preferences.fields[key].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))
                    ) : (
                      <td colSpan={Object.keys(preferences.fields).length}>
                        <select
                          value={editRowData.service}
                          onChange={(e) =>
                            setEditRowData({
                              ...editRowData,
                              service: e.target.value,
                            })
                          }
                        >
                          <option value="" disabled>
                            Select Service
                          </option>
                          {serviceOptions.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    <td>
                      <input
                        className="edit-input"
                        type="number"
                        value={editRowData.amount}
                        onChange={(e) =>
                          setEditRowData({
                            ...editRowData,
                            amount: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="edit-input"
                        type="text"
                        value={editRowData.remarks}
                        onChange={(e) =>
                          setEditRowData({
                            ...editRowData,
                            remarks: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="edit-btns">
                      <button
                        style={{ backgroundColor: "green" }}
                        className="edit-btn"
                        onClick={() =>
                          saveEditedData(
                            item.typeOfTransaction ? "expenses" : "revenue",
                            item.id
                          )
                        }
                      >
                        <i
                          style={{ color: "white" }}
                          className="fa-solid fa-check"
                        ></i>
                      </button>
                      <button
                        style={{ backgroundColor: "red" }}
                        className="edit-btn"
                        onClick={() => setEditRowId(null)}
                      >
                        <i
                          style={{ color: "white" }}
                          className="fa-solid fa-xmark"
                        ></i>
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.date || "-"}</td>

                    {item.typeOfTransaction ? (
                      Object.keys(preferences.fields).map((key) => (
                        <td key={key}>{item[key] || "-"}</td>
                      ))
                    ) : (
                      <td colSpan={Object.keys(preferences.fields).length}>
                        {item.service || "-"}
                      </td>
                    )}

                    <td
                      style={
                        item.typeOfTransaction
                          ? { color: "red", fontWeight: "800" }
                          : { color: "green", fontWeight: "800" }
                      }
                    >
                      ₹{item.amount || "0"}
                    </td>
                    <td>{item.remarks || "-"}</td>
                    <td className="actionCell">
                      <i
                        className="fa-solid fa-pen-to-square"
                        onClick={() => {
                          setEditRowId(item.id);
                          setEditRowData(item);
                        }}
                        title="Edit"
                      ></i>
                      <i
                        className="fa-solid fa-trash"
                        onClick={() =>
                          handleDeleteData(
                            item.typeOfTransaction ? "expenses" : "revenue",
                            item.id
                          )
                        }
                        title="Delete"
                      ></i>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------------- */}
      {/* 
{(view == "all" || view == "expenses") &&
<h2 className='table-head'>Expense Overview</h2>}
      {(view == "all" || view == "expenses") && (
        <div className='tableDiv'>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
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
    <td>Type</td>
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
          <td>{expense.date || "-"}</td>

          {preferences && Object.keys(preferences.fields).map((key) => (
            <td key={key}>{expense[key] || "-"}</td>
          ))}

          <td>₹{expense.amount || "0"}</td>
          <td>{expense.remarks || "-"}</td>
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




   {(view == "revenue" || view == "all") &&
   <h2 className='table-head'>Revenue Overview</h2>}
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
                      <td>{revenue.date || "-"}</td>
                      <td>{revenue.service || "-"}</td>
                      <td>₹{revenue.amount || "0"}</td>
                      <td>{revenue.remarks || "-"}</td>
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
      )} */}
    </>
  );
};

export default ExpenseTable;
