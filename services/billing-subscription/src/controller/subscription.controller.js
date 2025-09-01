import mongoose from "mongoose";
import planRepository from "../respositories/planRepository.js";
import userRepository from "../respositories/userRepository.js";
import planHistoryRepository from "../respositories/planHistoryRepository.js";
const getExpiredDate = (type, date) => {
    let expireDate = null;
    if (type == "yearly") {
        const planDate = new Date(date);
        planDate.setFullYear(planDate.getFullYear() + 1);
        expireDate = new Date(planDate);
    } else {
        const planDate = new Date(date);
        planDate.setMonth(planDate.getMonth() + 1);
        expireDate = new Date(planDate);
    }

    return expireDate;
}

const subscription = async (req, res, next) => {
    try {
        const userId = req?.user?.userId;
        const planId = req?.body?.planId;
        if (!userId) {
            return res.status(404).json({
                status: "fail",
                statusCode: 404,
                message: "User not found",
                data: {}
            });
        }
        let [error, user] = await userRepository.findOneById(userId);
        
        if (!user) {
            return res.status(404).json({
                status: "fail",
                statusCode: 404,
                message: "User not found",
                data: {}
            });
        }

        let [ error2, plan ] = await planRepository.findOneById(planId);

        if (!plan) {
            return res.status(404).json({
                status: "fail",
                statusCode: 404,
                message: "Plan not found",
                data: {}
            });
        }

        let planStartDate = new Date();

        let successMsg = "";

        if (user?.subscription?.status == "Active") {
            user.subscription.upcomingPlan = planId;
            planStartDate = new Date(user?.subscription?.expireDate);    
            successMsg = "You already have an active plan. This new plan will start once your current plan ends.";
        } else {
            user.subscription.startDate = planStartDate;
            user.subscription.expireDate = getExpiredDate(plan?.duration, new Date());
            user.subscription.status = "Active";
            user.subscription.upcomingPlan = null;
            successMsg = "Subscription successful. Thanks for joining!";
        }

        await user.save();

        await planHistoryRepository.insertOne({ userId: userId, planId: planId, activeDate: planStartDate });

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: successMsg,
            data: {}
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "fail",
            statusCode: 500,
            message: "Something want wrong",
            data: {}
        });
    }
};

export {
    subscription
}