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
    baseFilter = {},
    {
      projection,
      sort,
      skip,
      limit,
      page = 1,
      pageSize = 10,
      search,
      filters = {}
    } = {}
  ) => {
    try {
      const finalFilter = { ...baseFilter };

      ['name', 'email', 'phoneNumber'].forEach((key) => {
        if (filters[key]) {
          finalFilter[key] = new RegExp(filters[key], 'i');
        }
      });

      if (search?.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        finalFilter.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ];
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const recordsToSkip = skip ?? (currentPage - 1) * currentPageSize;
      const recordsLimit = limit ?? currentPageSize;

      let dbQuery = Model.find(finalFilter).skip(recordsToSkip).limit(recordsLimit);

      if (projection) dbQuery = dbQuery.select(projection);
      if (sort && typeof sort === 'object') dbQuery = dbQuery.sort(sort);

      const [results, totalRecords] = await Promise.all([
        dbQuery.exec(),
        Model.countDocuments(finalFilter)
      ]);

      const totalPages = Math.ceil(totalRecords / recordsLimit);
      const hasNext = currentPage < totalPages;
      const hasPrevious = currentPage > 1;

      return {
        error: null,
        data: {
          items: results,
          pagination: {
            currentPage,
            pageSize: recordsLimit,
            totalItems: totalRecords,
            totalPages,
            hasNextPage: hasNext,
            hasPrevPage: hasPrevious,
            nextPage: hasNext ? currentPage + 1 : null,
            prevPage: hasPrevious ? currentPage - 1 : null
          },
          filters: {
            search,
            ...filters
          }
        }
      };
    } catch (err) {
      return {
        error: err.message,
        data: null
      };
    }
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
