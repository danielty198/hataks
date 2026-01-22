const { model: Repair } = require('../models/Repairs');

// Pastel colors for statuses
const PASTEL_COLORS = [
  '#a8e6cf', '#dcedc1', '#ffd3a5', '#ffaaa5', '#ff8b94',
  '#b5ead7', '#c7ceea', '#ffeaa7', '#dfe6e9', '#fab1a0',
  '#74b9ff', '#a29bfe', '#fd79a8', '#e17055', '#00b894',
];

/**
 * GET /api/bi/pie-data
 * Get pie chart data for specified hatakTypes, optionally filtered by manoiya
 * 
 * Query params:
 * - hatakTypes: array of hatak types to get data for
 * - manoiya: array of manoiya values to filter by (optional)
 */
exports.getPieData = async (req, res) => {
  try {
    let { hatakTypes, manoiya } = req.query;

    // Ensure hatakTypes is an array
    if (!hatakTypes ||hatakTypes.includes('הכל') ) {
      hatakTypes = [];
    } else if (!Array.isArray(hatakTypes)) {
      hatakTypes = [hatakTypes];
    }

    // Ensure manoiya is an array if provided
    if (manoiya && !Array.isArray(manoiya)) {
      manoiya = [manoiya];
    }

    // Build match stage
    const matchStage = {};
    if (hatakTypes.length > 0) {
      matchStage.hatakType = { $in: hatakTypes };
    }
    if (manoiya && manoiya.length > 0) {
      matchStage.manoiya = { $in: manoiya };
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            hatakType: '$hatakType',
            hatakStatus: '$hatakStatus',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.hatakType',
          statuses: {
            $push: {
              status: '$_id.hatakStatus',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ];

    const results = await Repair.aggregate(pipeline);

    // Get all unique statuses for color mapping
    const allStatuses = await Repair.distinct('hatakStatus');
    const statusColorMap = {};
    allStatuses.forEach((status, index) => {
      statusColorMap[status] = PASTEL_COLORS[index % PASTEL_COLORS.length];
    });

    // Transform results into pieData format
    const pieData = {};
    let totalCount = 0;

    hatakTypes.forEach((type) => {
      pieData[type] = [];
    });

    results.forEach((item) => {
      const hatakType = item._id;
      totalCount += item.total;

      pieData[hatakType] = item.statuses
        .filter((s) => s.status && s.count > 0)
        .map((s) => ({
          name: s.status,
          value: s.count,
          color: statusColorMap[s.status] || '#ccc',
        }));
    });

    res.json({
      pieData,
      totalCount,
      statusColorMap,
    });
  } catch (error) {
    console.error('Error getting pie data:', error);
    res.status(500).json({ message: 'שגיאה בטעינת נתוני עוגות', error: error.message });
  }
};

/**
 * GET /api/bi/table-data
 * Get complex table data aggregated by hatakType, manoiya, and hatakStatus
 */
exports.getTableData = async (req, res) => {
  try {
    // Aggregation pipeline
    const pipeline = [
      {
        $group: {
          _id: {
            hatakType: '$hatakType',
            manoiya: '$manoiya',
            hatakStatus: '$hatakStatus',
          },
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Repair.aggregate(pipeline);

    // Get all unique values for structure
    const [allHatakTypes, allManoiya, allStatuses] = await Promise.all([
      Repair.distinct('hatakType'),
      Repair.distinct('manoiya'),
      Repair.distinct('hatakStatus'),
    ]);

    // Initialize table structure
    const tableData = {};

    allHatakTypes.forEach((hatakType) => {
      tableData[hatakType] = {};

      // Initialize for each manoiya
      allManoiya.forEach((manoiya) => {
        tableData[hatakType][manoiya] = {};
        allStatuses.forEach((status) => {
          tableData[hatakType][manoiya][status] = 0;
        });
      });

      // Initialize sum column
      tableData[hatakType]['sum'] = {};
      allStatuses.forEach((status) => {
        tableData[hatakType]['sum'][status] = 0;
      });
    });

    // Fill in the data
    let totalCount = 0;
    results.forEach((item) => {
      const { hatakType, manoiya, hatakStatus } = item._id;
      const count = item.count;

      if (hatakType && manoiya && hatakStatus) {
        if (tableData[hatakType] && tableData[hatakType][manoiya]) {
          tableData[hatakType][manoiya][hatakStatus] = count;
          tableData[hatakType]['sum'][hatakStatus] += count;
          totalCount += count;
        }
      }
    });

    res.json({
      tableData,
      totalCount,
      hatakTypes: allHatakTypes,
      manoiyaOptions: allManoiya,
      statusOptions: allStatuses,
    });
  } catch (error) {
    console.error('Error getting table data:', error);
    res.status(500).json({ message: 'שגיאה בטעינת נתוני טבלה', error: error.message });
  }
};

/**
 * GET /api/bi/summary
 * Get summary statistics
 */
exports.getSummary = async (req, res) => {
  try {
    const [
      totalCount,
      byHatakType,
      byManoiya,
      byStatus,
    ] = await Promise.all([
      Repair.countDocuments(),
      Repair.aggregate([
        { $group: { _id: '$hatakType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Repair.aggregate([
        { $group: { _id: '$manoiya', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Repair.aggregate([
        { $group: { _id: '$hatakStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalCount,
      byHatakType: byHatakType.map((item) => ({ name: item._id, value: item.count })),
      byManoiya: byManoiya.map((item) => ({ name: item._id, value: item.count })),
      byStatus: byStatus.map((item) => ({ name: item._id, value: item.count })),
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ message: 'שגיאה בטעינת סיכום', error: error.message });
  }
};
