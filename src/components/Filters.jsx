import React from 'react';
import './Filters.css';

const Filters = ({
  setSortBy,
  filterValues,
  setFilterValues,
  setSearchText,
  preferences
}) => {
  const fields = preferences?.fields || {};

  return (
    <div className='filter-div'>
      <label htmlFor="searchFilter">Search </label>
      <input
        placeholder='Search remarks, amount'
        type="text"
        id="searchFilter"
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Dynamically generate filter dropdowns from preferences.fields */}
      {Object.entries(fields).map(([fieldKey, options]) => (
        <React.Fragment key={fieldKey}>
          <label htmlFor={`${fieldKey}-filter`}>{fieldKey} </label>
          <select
            id={`${fieldKey}-filter`}
            onChange={(e) =>
              setFilterValues({ ...filterValues, [`${fieldKey}`]: e.target.value })
            }
          >
            <option value="All">All</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </React.Fragment>
      ))}

      <label htmlFor="sort-by">Sort By </label>
      <select
        id="sort-by"
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value='date'>Date incurred</option>
        <option value='amount'>Amount</option>
        <option value='createdAt'>Date added</option>
      </select>
    </div>
  );
};

export default Filters;
