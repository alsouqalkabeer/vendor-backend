// src/seedDashboardData.js
import { pool } from './index.js';

const seedDashboardData = async (vendorId) => {
  try {
    // Check if vendor exists
    const vendorCheck = await pool.query('SELECT id FROM vendors WHERE id = $1', [vendorId]);
    
    if (vendorCheck.rows.length === 0) {
      console.error(`No vendor found with ID: ${vendorId}`);
      return;
    }
    
    // Check if analytics data already exists for this vendor
    const analyticsCheck = await pool.query(
      'SELECT COUNT(*) FROM analytics WHERE vendor_id = $1',
      [vendorId]
    );
    
    if (parseInt(analyticsCheck.rows[0].count) > 0) {
      console.log(`Analytics data already exists for vendor ID: ${vendorId}`);
      return;
    }
    
    // Insert analytics data
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    
    // Insert main dashboard metrics
    await pool.query(
      `INSERT INTO analytics (
        vendor_id, date, total_sales, active_sales, product_revenue, daily_income, 
        deposit_income, spendings, day_of_week, month, year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        vendorId,
        today,
        50000, // Total sales
        28000, // Active sales
        16000, // Product revenue
        15000, // Daily income
        5000,  // Deposit income
        8000,  // Spendings
        getDayOfWeek(currentDate),
        getMonthName(currentDate),
        currentDate.getFullYear()
      ]
    );
    
    // Insert data for the past week for chart
    const pastDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const incomeValues = [14000, 14500, 15200, 15500, 15800, 15200, 14800];
    const depositValues = [4800, 5000, 5200, 5400, 5500, 5200, 5000];
    const spendingValues = [7500, 8000, 8500, 8700, 8900, 8700, 8500];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
      const dateStr = date.toISOString().split('T')[0];
      
      // Don't insert duplicate for today
      if (dateStr === today && i === 6) continue;
      
      await pool.query(
        `INSERT INTO analytics (
          vendor_id, date, daily_income, deposit_income, spendings, 
          day_of_week, month, year
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          vendorId,
          dateStr,
          incomeValues[i],
          depositValues[i],
          spendingValues[i],
          pastDays[i],
          getMonthName(date),
          date.getFullYear()
        ]
      );
    }
    
    // Insert sample orders
    const products = [
      'Teddy Bear XL',
      'Plush Bunny',
      'Soft Elephant',
      'Giraffe Plush',
      'Panda Bear'
    ];
    
    const customers = [
      'Ahmed Mohamed',
      'Sarah Johnson',
      'Mahmoud Ali',
      'Fatima Hassan',
      'Omar Farooq'
    ];
    
    const statuses = [
      'pending',
      'shipped',
      'delivered',
      'cancelled',
      'processing'
    ];
    
    // Insert 5 orders
    for (let i = 0; i < 5; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - i); // Spaced over the last 5 days
      
      await pool.query(
        `INSERT INTO orders (
          order_number, vendor_id, customer_name, total_amount, 
          currency, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          `#${1000 + i}`,
          vendorId,
          customers[i],
          (300 * (i + 1)),
          'USD',
          statuses[i],
          orderDate.toISOString()
        ]
      );
    }
    
    console.log(`Dashboard data seeded successfully for vendor ID: ${vendorId}`);
    
  } catch (error) {
    console.error('Error seeding dashboard data:', error);
  }
};

// Helper functions
function getDayOfWeek(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
}

function getMonthName(date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()];
}

export default seedDashboardData;