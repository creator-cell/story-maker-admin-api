import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  menu: {
    type: [{
      menuName: {
        type: String,
        required: true,
        trim: true
      },
      read: {
        type: Boolean,
        default: false
      },
      write: {
        type: Boolean,
        default: false
      },
      both: {
        type: Boolean,
        default: false
      }
    }],
    required: true,
   
  }
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
