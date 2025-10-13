import userRepository from "../respositories/userRepository.js";
import {
  getDateRange,
  getDateWeek,
  getMonthWeekDateRange,
} from "../helper/dateMathod.js";
import {
    getStorage
} from "../helper/s3Client.js"

const filterDataByMode = (data, dateRange, mode) => {
  const statistic = [];

  if (mode == "month") {
    let monthDate = new Date(dateRange.startDate);
    monthDate.setDate(monthDate.getDate() + 1);
    monthDate = new Date(monthDate);

    let index = getDateWeek(monthDate);

    while (
      monthDate <= new Date(dateRange.endDate) &&
      monthDate <= new Date()
    ) {
      const resultIndex = data?.findIndex((fi) => fi._id.week == index);
      const monthDateRange = getMonthWeekDateRange(
        monthDate,
        dateRange?.startDate,
        dateRange?.endDate
      );

      if (resultIndex > -1) {
        statistic.push({
          date: `${String(monthDateRange?.startDate?.getDate()).padStart(
            2,
            "0"
          )}-${String(monthDateRange?.startDate?.getMonth() + 1).padStart(
            2,
            "0"
          )} To ${String(monthDateRange?.endDate?.getDate()).padStart(
            2,
            "0"
          )}-${String(monthDateRange?.endDate?.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
          count: data?.[resultIndex]?.count || 0,
        });
      } else {
        statistic.push({
          date: `${String(monthDateRange?.startDate?.getDate()).padStart(
            2,
            "0"
          )}-${String(monthDateRange?.startDate?.getMonth() + 1).padStart(
            2,
            "0"
          )} To ${String(monthDateRange?.endDate?.getDate()).padStart(
            2,
            "0"
          )}-${String(monthDateRange?.endDate?.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
          count: 0,
        });
      }

      monthDate = monthDateRange?.endDate;

      monthDate.setDate(monthDate?.getDate() + 2);

      index = getDateWeek(monthDate);
    }
  } else if (mode == "week") {
    let index = new Date(dateRange.startDate);
    while (index <= dateRange.endDate && index <= new Date()) {
      const resultIndex = data?.findIndex(
        (fi) =>
          fi.date ==
          `${index.getFullYear()}-${index.getMonth() + 1}-${index.getDate()}`
      );

      if (resultIndex > -1) {
        statistic.push({
          date: `${index.getFullYear()}-${String(index.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(index.getDate()).padStart(2, "0")}`,
          count: data?.[resultIndex]?.count || 0,
        });
      } else {
        statistic.push({
          date: `${index.getFullYear()}-${String(index.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(index.getDate()).padStart(2, "0")}`,
          count: 0,
        });
      }
      index.setDate(index.getDate() + 1);
    }
  } else {
    for (let index = 0; index < 24; index++) {
      const resultIndex = data?.findIndex((fi) => fi._id.hour == index);

      if (resultIndex > -1) {
        statistic.push({
          date: `${index}-${index + 1 == 24 ? "00" : index + 1}`,
          count: data?.[resultIndex]?.count || 0,
        });
      } else {
        statistic.push({
          date: `${index}-${index + 1 == 24 ? "00" : index + 1}`,
          count: 0,
        });
      }
    }
  }

  return statistic;
};

const dashboardData = async (req, res, next) => {
  try {
    const [err, data] = await userRepository.count({ isActive: true });

    if (err) {
      return res.status(500).json({
        status: "fail",
        statusCode: 500,
        message: "Failed to get data",
        data: {},
      });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Data fetched successfully.",
      data: {
        activeUsers: data,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something want wrong",
      data: {},
    });
  }
};

const userGrowthData = async (req, res, next) => {
  try {
    let { mode, date } = req.query;

    const ALL_MODE = ["month", "week", "day"];

    mode =
      mode !== undefined && mode !== null && ALL_MODE.includes(mode)
        ? mode
        : "day";
    date =
      date !== undefined && date !== null && !isNaN(new Date(date))
        ? new Date(date)
        : new Date();

    let mainQuery = [
      { $match: {} },
      { $group: { _id: {}, count: { $sum: 1 } } },
    ];

    let dateRange = getDateRange(date, mode);

    if (mode == "month") {
      mainQuery[0].$match = {
        isActive: true,
        createdAt: {
          $gte: new Date(dateRange?.startDate),
          $lte: new Date(dateRange?.endDate),
        },
      };
      mainQuery[1].$group._id = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        week: { $week: "$createdAt" },
      };
    } else if (mode == "week") {
      mainQuery[0].$match = {
        isActive: true,
        createdAt: {
          $gte: new Date(dateRange?.startDate),
          $lte: new Date(dateRange?.endDate),
        },
      };
      mainQuery[1].$group._id = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      mainQuery.push({
        $set: {
          date: {
            $concat: [
              {$toString: "$_id.year"},"-",
              {$toString: "$_id.month"},"-",
              {$toString: "$_id.day"},
            ],
          },
        },
      });
    } else {
      dateRange.startDate = new Date(new Date(date).setHours(0, 0, 0, 0));
      dateRange.endDate = new Date(new Date(date).setDate(date.getDate() + 1));

      mainQuery[0].$match = {
        isActive: true,
        createdAt: {
          $gte: new Date(dateRange?.startDate),
          $lt: new Date(dateRange?.endDate),
        },
      };
      mainQuery[1].$group._id = {
        hour: { $hour: "$createdAt" },
      };
    }

    const [error, result] = await userRepository.aggregate(mainQuery);

    if (error) {
      console.log(error);
      return res.status(500).json({
        status: "fail",
        statusCode: 500,
        message: "Failed to get user growth data",
        data: {},
      });
    }

    let data = filterDataByMode(result || [], dateRange, mode);

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Successfully get user growth data",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something want wrong",
      data: {},
    });
  }
};

const awsStorages = async (req, res, next) => {
  try {

    const data = await getStorage();

    return res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Successfully get storage",
        data: {
            bucketSize: data?.data
        }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something want wrong",
      data: {},
    });
  }
};

const topTemplateAssets = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something want wrong",
      data: {},
    });
  }
};

export { dashboardData, userGrowthData, awsStorages, topTemplateAssets };
