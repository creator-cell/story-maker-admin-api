import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },


    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    templates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template", 
      },
    ],

  
    subCategories: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        assets: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
          },
        ],
        templates: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Template",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

   
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
