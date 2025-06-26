import { createBaseRepository } from './baseRepository.js';
import User from '../models/user.model.js';

const {
  insertOne,
  findOne,
  findMany,
  updateOne,
  deleteOne,
  count,
  findOneById,
  findOneAndUpdate,
  aggregate,
  getManyWithPagination
} = createBaseRepository(User);

// Custom methods (example)
const findByEmail = async (email) => findOne({ email });
const userRepository = {
  insertOne,
  findOne,
  findOneById,
  findMany,
  getManyWithPagination,
  updateOne,
  findOneAndUpdate,
  deleteOne,
  count,
  aggregate,
  findByEmail,
};


export default userRepository ;
