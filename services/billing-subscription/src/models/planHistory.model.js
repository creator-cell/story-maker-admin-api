import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PlanHistorySchema = Schema({
    userId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    planId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: "plan"
    }
}, {
    timestamps: true
});

const PlanHistory = mongoose.model('planHistory', PlanHistorySchema);

export default PlanHistory;