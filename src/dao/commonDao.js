import sequelize from '../models/index';

import userModel from '../models/user';
import { Sequelize } from 'sequelize';
import e from 'express';
import { Op } from 'sequelize';



export const getAllCounts = async () => {
  const users = await userModel.count({where: { is_active: true }});
  return { users };
};


// Helper function to create UTC month boundaries
function getUTCMonthStart(year, month) {
  return new Date(Date.UTC(year, month, 1));
}

// Main function to get monthly counts
async function getMonthlyCounts(model, dateField = 'created_at', whereCondition = {}) {
  const now = new Date();
  const currentUTCYear = now.getUTCFullYear();
  const currentUTCMonth = now.getUTCMonth();

  // Calculate UTC date boundaries
  const currentMonthStart = getUTCMonthStart(currentUTCYear, currentUTCMonth);
  const currentMonthEnd = getUTCMonthStart(currentUTCYear, currentUTCMonth + 1);
  const lastMonthStart = getUTCMonthStart(
    currentUTCMonth === 0 ? currentUTCYear - 1 : currentUTCYear,
    currentUTCMonth === 0 ? 11 : currentUTCMonth - 1
  );

  const results = await model.findAll({
    attributes: [
      [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col(dateField)), 'month'],
      [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
    ],
    where: {
      [dateField]: {
        [Op.gte]: lastMonthStart,
        [Op.lt]: currentMonthEnd
      },
      ...whereCondition
    },
    group: ['month'],
    raw: true
  });

  // Convert results to map
  const countMap = results.reduce((acc, { month, count }) => {
    const monthKey = new Date(month).toISOString().slice(0, 7);
    acc[monthKey] = parseInt(count, 10);
    return acc;
  }, {});

  const currentMonthKey = currentMonthStart.toISOString().slice(0, 7);
  const lastMonthKey = lastMonthStart.toISOString().slice(0, 7);

  return {
    current: countMap[currentMonthKey] || 0,
    previous: countMap[lastMonthKey] || 0
  };
}

// Percentage calculator
async function calculateMonthlyPercentageChanges(tables) {
  const results = {};

  await Promise.all(tables.map(async ({ name, model, dateField, whereCondition }) => {
    try {
      const { current, previous } = await getMonthlyCounts(model, dateField, whereCondition);
      
      let percentage = 0;
      if (previous > 0) {
        percentage = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        percentage = 100;
      }

      results[name] = {
        current,
        previous,
        percentage: Number(percentage.toFixed(2)),
        trend: current >= previous ? 'up' : 'down'
      };
    } catch (error) {
      results[name] = { error: error.message };
    }
  }));

  return results;
}



export const getPercentageChanges = async () => {
  const tables = [
    { name: 'users', model: userModel },
  ];
  return await calculateMonthlyPercentageChanges(tables);
}



//Charts --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Helper function to generate a list of dates between two dates
const generateDateRange = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
  }

  return dateArray;
}

// Common function to fetch date-wise counts from multiple tables
export const getDateWiseCountsForTables = async (tables, startDate, endDate) => {
  const results = [];
  const allDates = generateDateRange(startDate, endDate); // Generate all dates between startDate and endDate

  // Iterate over the tables passed in
  for (let table of tables) {
    const { model, name, dateColumn = 'createdAt' } = table;

    // Fetch the date-wise count for each table
    const data = await model.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col(dateColumn)), 'date'], // Group by date
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'] // Count records
      ],
      where: {
        [dateColumn]: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col(dateColumn))], // Group by date
      order: [[Sequelize.fn('DATE', Sequelize.col(dateColumn)), 'ASC']], // Order by date
      raw: true
    });

    // Create an object where the date is the key and the count is the value
    const dateCounts = data.reduce((acc, item) => {
      acc[item.date] = item.count;
      return acc;
    }, {});

    // Ensure all dates are included, even if there's no data for a specific day
    const counts = allDates.map(date => dateCounts[date.toISOString().split('T')[0]] || 0);
    const dates = allDates.map(date => date.toISOString().split('T')[0]); // Format as YYYY-MM-DD

    // Push the data for this table into the results array
    results.push({
      name,
      type: table.type || 'line',
      data: counts,
      labels: dates
    });
  }

  // Return the final formatted data
  return results;
}
//Charts --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
