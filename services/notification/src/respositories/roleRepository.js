import { createBaseRepository } from './baseRepository.js';
import Role from '../models/role.model.js';

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
} = createBaseRepository(Role);


const findByName = async (name) => findOne({ name });

const roleRepository = {
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
  findByName,
};

export default roleRepository;
