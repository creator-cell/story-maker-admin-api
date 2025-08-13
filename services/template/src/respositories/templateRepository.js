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

const cloneTemplate = async (id) => {
  const getData = await Template.findById(id)
    .populate("category")
    .populate("subCategory");
  if (!getData) return null;
  const clonedData = getData.toObject();
  delete clonedData._id;
  const newTemplate = await Template.create(clonedData);
  return newTemplate;
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
