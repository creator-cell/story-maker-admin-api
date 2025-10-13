import { createBaseRepository } from "./baseRepository.js";
import User from "../models/user.model.js";
import { safeAwait } from "../utils/safeAwait.js";

const {
  insertOne,
  findOne,
  updateOne,
  updateMany,
  deleteOne,
  count,
  findOneById,
  findOneAndUpdate,
  aggregate,
  getManyWithPagination,
} = createBaseRepository(User);

const findMany = async (query = {}, { projection, sort } = {}) => {
  let q = User.find(query).populate("role", "name");

  if (projection) q = q.select(projection);
  if (sort) q = q.sort(sort);

  return safeAwait(q.exec());
};

// Custom methods (example)
const findByEmail = async (email) => findOne({ email });
const userRepository = {
  insertOne,
  findOne,
  findOneById,
  findMany,
  getManyWithPagination,
  updateOne,
  updateMany,
  findOneAndUpdate,
  deleteOne,
  count,
  aggregate,
  findByEmail
};

export default userRepository;
