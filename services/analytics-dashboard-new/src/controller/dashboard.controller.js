import userRepository from "../respositories/userRepository.js";
import User from "../models/user.model.js";
import templateModel from "../models/template.model.js";
import {
  getDateRange,
  getDateWeek,
  getMonthWeekDateRange,
} from "../helper/dateMathod.js";
import { getStorage } from "../helper/s3Client.js";

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

const templateCreated = async (req, res, next) => {
  try {
    const data = await templateModel.countDocuments();
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Data fetched successfully.",
      data: {
        templateCount: data,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const templateUsed = async (req, res, next) => {
  try {
    const allTemplatesUsage = await templateModel.aggregate([
      {
        $group: {
          _id: "$template",
          templateCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "templates",
          localField: "_id",
          foreignField: "_id",
          as: "templateDetails",
        },
      },
      {
        $unwind: "$templateDetails",
      },
      {
        $project: {
          _id: 0,
          templateName: "$templateDetails.name",
          templateCount: 1,
        },
      },
      {
        $sort: { templateCount: -1 },
      },
    ]);

    res.json(allTemplatesUsage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userGrowthData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const result = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const formatted = result.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      count: item.count,
    }));

    console.log("User growth:", formatted);
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching user growth:", error);
    next(error);
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
        bucketSize: data?.data,
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

export {
  dashboardData,
  userGrowthData,
  awsStorages,
  topTemplateAssets,
  templateCreated,
  templateUsed,
};
