import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  menu: {type:Object,required:true},
  read:{type:Boolean,required:true},
  write:{type:Boolean,required:true},
  both:{type:Boolean,required:true},
  
 
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
