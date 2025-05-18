// routes/dashboardRoutes.js
import express from 'express';
import { pool } from '../index.js';
import seedDashboardData from '../seedDashboardData.js';

const router = express.Router();

// GET /api/dashboard/:vendorId
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`Dashboard data requested for vendor ID: ${vendorId}`);
    
    // Check if vendor exists
    const vendorCheck = await pool.query(
      'SELECT * FROM vendors WHERE id = $1',
      [vendorId]
    );
    
    if (vendorCheck.rows.length === 0) {
      console.log(`Vendor not found with ID: ${vendorId}`);
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    const vendor = vendorCheck.rows[0];
    console.log(`Vendor found: ${vendor.name}`);
    
    // Check if analytics data exists
    const analyticsCheck = await pool.query(
      'SELECT COUNT(*) FROM analytics WHERE vendor_id = $1',
      [vendorId]
    );
    
    // If no analytics data exists, seed it
    if (parseInt(analyticsCheck.rows[0].count) === 0) {
      console.log(`No analytics data found for vendor ID: ${vendorId}, seeding data...`);
      await seedDashboardData(vendorId);
      console.log('Data seeding completed');
    } else {
      console.log(`Found ${analyticsCheck.rows[0].count} analytics records for vendor`);
    }
    
    // Get dashboard overview data
    console.log('Fetching dashboard overview data...');
    const today = new Date().toISOString().split('T')[0];
    console.log(`Using today's date: ${today}`);
    
    const dashboardData = await pool.query(
      `SELECT 
        total_sales, active_sales, product_revenue, daily_income
      FROM analytics 
      WHERE vendor_id = $1 AND date = $2`,
      [vendorId, today]
    );
    
    console.log(`Dashboard data rows found: ${dashboardData.rows.length}`);
    
    // Get analytics chart data for the past week
    console.log('Fetching analytics chart data...');
    const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    console.log(`One week ago date: ${oneWeekAgo}`);
    
    const chartData = await pool.query(
      `SELECT 
        date, day_of_week, daily_income, deposit_income, spendings
      FROM analytics 
      WHERE vendor_id = $1 AND date >= $2
      ORDER BY date ASC`,
      [vendorId, oneWeekAgo]
    );
    
    console.log(`Chart data rows found: ${chartData.rows.length}`);
    
    // Get last orders
    console.log('Fetching last orders...');
    const lastOrders = await pool.query(
      `SELECT 
        id, order_number as "orderNumber", customer_name as "customerName", 
        total_amount as "totalAmount", currency, status, created_at as "createdAt"
      FROM orders 
      WHERE vendor_id = $1
      ORDER BY created_at DESC
      LIMIT 5`,
      [vendorId]
    );
    
    console.log(`Last orders found: ${lastOrders.rows.length}`);
    
    // Format response
    const response = {
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        logoUrl: vendor.logo_url,
        lastSeen: vendor.last_seen
      },
      dashboard: {
        overview: {
          totalSales: dashboardData.rows[0]?.total_sales || 50000,
          activeSales: dashboardData.rows[0]?.active_sales || 28000,
          productRevenue: dashboardData.rows[0]?.product_revenue || 16000,
          dailyIncome: dashboardData.rows[0]?.daily_income || 15000
        },
        analytics: {
          chartData: chartData.rows.map(row => ({
            date: row.date,
            dayOfWeek: row.day_of_week,
            income: parseFloat(row.daily_income || 0),
            depositIncome: parseFloat(row.deposit_income || 0),
            spendings: parseFloat(row.spendings || 0)
          }))
        },
        lastOrders: lastOrders.rows.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalAmount: parseFloat(order.totalAmount || 0),
          currency: order.currency,
          status: order.status,
          createdAt: order.createdAt
        }))
      }
    };
    
    console.log('Dashboard data response prepared and sending...');
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Print detailed error information for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data',
      error: error.message
    });
  }
});

export default router;