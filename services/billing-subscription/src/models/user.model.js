import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  phone: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  emailVerified: {
    type: Boolean,default:false
  },
  createdAt: {
    type: Date, default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    startDate: {
      type: Date,
      default: null,
    },
    expireDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Expired"],
      default: "Pending"
    },
    upcomingPlan: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "plan"
    }
  }
});

const User = mongoose.model('User', userSchema);

export default User;
