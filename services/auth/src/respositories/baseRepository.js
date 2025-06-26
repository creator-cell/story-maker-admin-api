import { safeAwait } from '../utils/safeAwait.js';

export const createBaseRepository = (Model) => {
  // Create
  const insertOne = async (doc) => safeAwait(Model.create(doc));
  const insertMany = async (docs) => safeAwait(Model.insertMany(docs));

  // Read
  const findOne = async (query = {}, projection = {}) =>
    safeAwait(Model.findOne(query, projection));

  const findOneById = async (id, projection = {}) =>
    safeAwait(Model.findById(id, projection));

  const findMany = async (query = {}, { projection, sort } = {}) => {
    let q = Model.find(query);

    if (projection) q = q.select(projection);
    if (sort) q = q.sort(sort);

    return safeAwait(q.exec());
  };

  const getManyWithPagination = async (
    query = {},
    { projection, sort, skip, limit } = {}
  ) => {
    let q = Model.find(query);

    if (projection) q = q.select(projection);
    if (sort) q = q.sort(sort);
    if (typeof skip === 'number') q = q.skip(skip);
    if (typeof limit === 'number') q = q.limit(limit);

    return safeAwait(q.exec());
  };

  // Update
  const updateOne = async (filter, update, options = {}) =>
    safeAwait(Model.updateOne(filter, update, options));

  const updateMany = async (filter, update, options = {}) =>
    safeAwait(Model.updateMany(filter, update, options));

  const findOneAndUpdate = async (filter, update, options = { new: true }) =>
    safeAwait(Model.findOneAndUpdate(filter, update, options));

  // Delete
  const deleteOne = async (filter) => safeAwait(Model.deleteOne(filter));
  const deleteMany = async (filter) => safeAwait(Model.deleteMany(filter));

  // Utility
  const count = async (query = {}) => safeAwait(Model.countDocuments(query));
  const aggregate = async (pipeline = []) => safeAwait(Model.aggregate(pipeline));

  return {
    insertOne,
    insertMany,
    findOne,
    findOneById,
    findMany,
    getManyWithPagination,
    updateOne,
    updateMany,
    findOneAndUpdate,
    deleteOne,
    deleteMany,
    count,
    aggregate,
  };
};
