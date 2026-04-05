const FinanceRecord = require('../model/financeRecord.model');

const getDashboardSummaryController = async (req, res) => {
  try {
    const match = { DeletedAt: null };

    const totals = await FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expense = totals.find((t) => t._id === 'expense')?.total || 0;

    const categoryTotals = await FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryTotalsByCategory = await FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recent = await FinanceRecord.find(match)
      .sort({ date: -1, record_id: -1 })
      .limit(10);

    const monthlyTrend = await FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const weeklyTrend = await FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$date' },
            week: { $isoWeek: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        totals: {
          income,
          expense,
          net: income - expense,
        },
        categoryTotals,
        categoryTotalsByCategory,
        recent,
        monthlyTrend,
        weeklyTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummaryController };

