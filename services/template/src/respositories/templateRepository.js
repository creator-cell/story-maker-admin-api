import { createBaseRepository } from "./baseRepository.js";
import Template from "../models/template.model.js";

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
  getManyWithPagination,
} = createBaseRepository(Template);

const findByName = async (name) => findOne({ name });

const templateRepository = {
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

export default templateRepository;
