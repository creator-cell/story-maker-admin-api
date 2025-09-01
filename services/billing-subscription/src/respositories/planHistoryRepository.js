import { createBaseRepository } from './baseRepository.js';
import PlanHistory from '../models/planHistory.model.js';

const {
  insertOne,
  findOne,
  findMany,
  updateOne,
  deleteOne,
  count,
  findOneById,
  findOneAndUpdate,
  aggregate
} = createBaseRepository(PlanHistory);

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
  console.log("Get Many With Pagination");
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

    let dbQuery = Plan.find(finalFilter).populate('uploadedBy', 'name email').skip(recordsToSkip).limit(recordsLimit);

    if (projection) dbQuery = dbQuery.select(projection);
    if (sort && typeof sort === 'object') dbQuery = dbQuery.sort(sort);

    const [results, totalRecords] = await Promise.all([
      dbQuery.exec(),
      Plan.countDocuments(finalFilter)
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

// Custom methods (example)
const findByEmail = async (email) => findOne({ email });
const planHistoryRepository = {
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


export default planHistoryRepository;
