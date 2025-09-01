import userRepository from "../respositories/userRepository.js";
import planRepository from "../respositories/planRepository.js";

const getExpireDate = (type, date) => {
    let expireDate = null;
    if (type == "yearly") {
        const planStartDate = new Date(date);
        planStartDate.setFullYear(planStartDate.getFullYear() + 1);
        expireDate = new Date(planStartDate);
    } else {
        const planStartDate = new Date(date);
        planStartDate.setMonth(planStartDate.getMonth() + 1);
        expireDate = new Date(planStartDate);
    }

    return expireDate;
}

const expirePlans = async () => {
    try {

        console.log("");
        console.log("");
        console.log("Expire plan process start --------------------------------------- ", new Date().toISOString());
        
        await userRepository.updateMany({"subscription.expireDate": { $lte:new Date() }}, { $set: { "subscription.status": "expired" } });

        console.log("Success: Expire plan process --------------------------------------- ", new Date().toISOString());

    } catch (error) {
        console.log("Failed to expire plan --------------------------------------- ", new Date().toISOString());
        console.log(error);
    }
};

const handleUpcomingPlan = async () => {
    try {
        console.log("");
        console.log("");
        console.log("Start set upcoming plan process --------------------------------------- ", new Date().toISOString());
        const [error, userUpcomingPlan] = await userRepository.findMany({
            "subscription.expireDate": { $lte:new Date() },
            "subscription.upcomingPlan": {$ne: null}
        }, {});

        if (!userUpcomingPlan) {
            console.log("Upcoming plan not found --------------------------------------- ", new Date().toISOString());
            return;
        }

        const [error2, allPlans] = await planRepository.findMany({}, {});

        userUpcomingPlan?.map( async (p) => {
            const planIndex = allPlans?.findIndex(fi => fi?._id?.toString() == p?.subscription?.upcomingPlan?.toString());
            const plan = allPlans[planIndex];
            if (!plan) {
                return;
            }

            p.subscription.startDate = p?.subscription?.expireDate;
            p.subscription.expireDate = getExpireDate(plan?.duration, p?.subscription?.expireDate);
            p.subscription.status = "Active";
            p.subscription.upcomingPlan = null;

            await p?.save();
        });

        console.log("Success: Set upcoming plan process --------------------------------------- ", new Date().toISOString());

    } catch (error) {
        console.log("Failed set upcoming plan --------------------------------------- ", new Date().toISOString());
        console.log(error);
    }
};

export {
    expirePlans,
    handleUpcomingPlan
}