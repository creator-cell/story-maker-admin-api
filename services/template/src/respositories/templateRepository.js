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

const cloneTemplate = async (data) => {
  try {
    let clonedData = { ...data };

    delete clonedData._id;
    delete clonedData.__v;

    clonedData.status = "pending";

    const newTemplate = new Template(clonedData);
    await newTemplate.save();

    return [null, newTemplate];
  } catch (err) {
    return [err, null];
  }
};

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
  cloneTemplate,
};

export default templateRepository;
