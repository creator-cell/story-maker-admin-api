import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },

  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Template", templateSchema);
