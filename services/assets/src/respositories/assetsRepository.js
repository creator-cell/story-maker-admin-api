import { createBaseRepository } from './baseRepository.js';
import Assets from '../models/assets.model.js';
import mongoose from 'mongoose';

const {
  insertOne,
  updateOne,
  deleteOne,
  count,
  findOneAndUpdate,
  aggregate
} = createBaseRepository(Assets);

/**
 * Finds multiple assets based on query filters, joins uploader and category data, and supports sorting, pagination, and custom projections.
 *
 * @param {Object} [matchQuery={}] - MongoDB query to filter assets (e.g., { type: "image" }).
 * @param {Object} [projection] - Optional MongoDB projection to select specific fields (default includes name, url, type, format, description, tags, status, uploadedBy, category, createdAt, updatedAt).
 * @param {Object} [sort] - Optional sort object (e.g., { createdAt: -1 } for newest first).
 * @param {Number} [limit] - Optional limit for pagination.
 * @param {Number} [skip] - Optional number of documents to skip for pagination.
 *
 * @returns {Promise<[string|boolean, Array|boolean]>}
 *   Returns [false, assets] on success or [errorMessage, false] on failure.
 *
 * The aggregation pipeline:
 *   - $lookup to join `uploadedBy` (users collection)
 *   - $lookup to join `category` (categories collection)
 *   - $unwind both joined fields with `preserveNullAndEmptyArrays` to avoid missing data
 *   - $project to select fields
 *   - $match to filter results based on `matchQuery`
 *   - Optional $sort, $skip, and $limit stages
 */

const findAssets = async (matchQuery = {}, projection, sort, limit, skip) => {
  try {
    const defaultProjection = { name: 1, url: 1, type: 1, format: 1, description: 1, tags: 1, status: 1, "uploadedBy._id": 1, "uploadedBy.name": 1, "uploadedBy.email": 1, "category._id": 1, "category.name": 1, "category.description": 1, "category.slug": 1, createdAt: 1, updatedAt: 1};
    const query = [
      { $lookup:{ from: "users", localField: "uploadedBy", foreignField: "_id", as: "uploadedBy"}},
      {$lookup: {from: "categories", localField: "_id", foreignField: "assets", as: "category"}},
      {$unwind: {path: '$category', "preserveNullAndEmptyArrays": true}},
      {$unwind: {path: '$uploadedBy', "preserveNullAndEmptyArrays": true}},
      {$project:projection ? projection : defaultProjection},
      { $match: matchQuery },
    ];

    if (sort) {
      query.push({
        $sort: sort
      });
    }

    if (skip || skip > 0) {
      query.push({
        $skip: skip
      });
    }

    if (limit || limit > 0) {
      query.push({
        $limit: limit
      });
    }

    console.log(query);

    const assets = await Assets.aggregate(query);
    if (!assets || assets?.length == 0) {
      return ["Assets not found", false];
    }
    return [false, assets];
  } catch (error) {
    return [error, false];
  }
}

/**
 * Counts the total number of assets that match the given query and joins uploader and category data.
 *
 * @param {Object} [matchQuery={}] - MongoDB query to filter assets (e.g., { type: "image", status: "active" }).
 *
 * @returns {Promise<[string|boolean, number|boolean]>}
 *   Returns [false, totalCount] on success or [errorMessage, false] on failure.
 *
 * The aggregation pipeline:
 *   - $lookup to join `uploadedBy` (users collection)
 *   - $lookup to join `category` (categories collection)
 *   - $unwind both joined fields
 *   - $match to filter results based on `matchQuery`
 *   - $count to calculate total number of matched assets
 */
const findTotalAssets = async (matchQuery = {}) => {
  try {
    const query = [
      { $lookup:{ from: "users", localField: "uploadedBy", foreignField: "_id", as: "uploadedBy"}},
      {$lookup: {from: "categories", localField: "_id", foreignField: "assets", as: "category"}},
      {$unwind: "$category"},
      {$unwind: "$uploadedBy"},
      { $match: matchQuery},
      {$count: 'totalAssets'}
    ];

    const assets = await Assets.aggregate(query);
    if (!assets || assets?.length == 0) {
      return ["Assets not found", false];
    }
    return [false, assets?.[0]?.totalAssets || 0];
  } catch (error) {
    return [error, false];
  }
}

/**
 * Finds a single asset by its ID and optionally applies a custom projection.
 *
 * @param {String} assetId - The ID of the asset to retrieve.
 * @param {Object} [projection] - Optional MongoDB projection to select specific fields.
 *
 * @returns {Promise<[string|boolean, Object|boolean]>}
 *   Returns [false, asset] on success or [errorMessage, false] on failure.
 *
 * Behavior:
 *   - Converts the assetId string to a MongoDB ObjectId
 *   - Calls `findAssets` internally with a match query for `_id`
 *   - Returns the first matched asset or false if not found
 */
const findById = async (assetId, projection) => {
  try {
    let match = { _id: new mongoose.Types.ObjectId(assetId) };
    const [errors, result] = await findAssets(match, projection);
    if (errors) {
      return [errors, false]
    }
    return [false, result?.[0]];
  } catch (error) {
    return [error, false];
  }
}

/**
 * Finds a single asset based on a query and optionally applies a custom projection.
 *
 * @param {Object} query - MongoDB query to filter the asset (e.g., { type: "image" }).
 * @param {Object} [projection] - Optional MongoDB projection to select specific fields.
 *
 * @returns {Promise<[string|boolean, Object|boolean]>}
 *   Returns [false, asset] on success or [errorMessage, false] on failure.
 *
 * Behavior:
 *   - Calls `findAssets` internally with the provided query and projection
 *   - Returns the first matched asset or false if no assets are found
 */
const findOne = async (query, projection) => {
  try {
    const [errors, result] = await findAssets(query, projection);
    if (errors) {
      return [errors, result];
    }
    return [false, result?.[0]];
  } catch (error) {
    return [error, false];
  }
}

/**
 * Finds multiple assets based on a query, with optional projection and sorting.
 *
 * @param {Object} [query={}] - MongoDB query to filter assets (e.g., { type: "image" }).
 * @param {Object} [options] - Optional settings for the query.
 * @param {Object} [options.projection] - MongoDB projection to select specific fields.
 * @param {Object} [options.sort] - Sort object to order results (e.g., { createdAt: -1 }).
 *
 * @returns {Promise<[string|boolean, Array|boolean]>}
 *   Returns [false, assets] on success or [errorMessage, false] on failure.
 *
 * Behavior:
 *   - Calls `findAssets` internally with the provided query, projection, and sort
 *   - Returns all matching assets or false if no assets are found
 */
const findMany = async (query = {}, { projection, sort } = {}) => {
  try {
    const [errors, result] = await findAssets(query, projection, sort);
    if (errors) {
      return [errors, false];
    }
    return [false, result];
  } catch (error) {
    return [error, false];
  }
};

/**
 * Retrieves multiple assets with support for pagination, optional filtering, projection, sorting, and search.
 *
 * @param {Object} [baseFilter={}] - Base MongoDB query to filter assets (e.g., { type: "image" }).
 * @param {Object} [options] - Optional settings for the query and pagination.
 * @param {Object} [options.projection] - MongoDB projection to select specific fields.
 * @param {Object} [options.sort] - Sort object to order results (e.g., { createdAt: -1 }).
 * @param {Number} [options.skip] - Number of records to skip (overrides page calculation if provided).
 * @param {Number} [options.limit] - Maximum number of records to return (overrides pageSize if provided).
 * @param {Number} [options.page=1] - Current page number for pagination.
 * @param {Number} [options.pageSize=10] - Number of items per page if `limit` is not provided.
 * @param {String} [options.search] - Search term to perform partial matching across multiple fields (name, description, tags, status, uploadedBy, category, etc.).
 *
 * @returns {Promise<[string|boolean, Object|boolean]>}
 *   Returns [false, data] on success or [errorMessage, false] on failure.
 * 
 * The returned `data` object structure:
 *   {
 *     items: Array,        // List of assets for the current page
 *     pagination: {
 *       currentPage: Number,
 *       pageSize: Number,
 *       totalItems: Number,
 *       totalPages: Number,
 *       hasNextPage: Boolean,
 *       hasPrevPage: Boolean,
 *       nextPage: Number|null,
 *       prevPage: Number|null
 *     }
 *   }
 *
 * Behavior:
 *   - Applies base filter and optional search across multiple fields
 *   - Calculates pagination based on page/pageSize or skip/limit
 *   - Calls `findAssets` for fetching records and `findTotalAssets` for total count
 *   - Returns paginated results along with metadata for navigation
 */

const getManyWithPagination = async (
    baseFilter = {},
    {
      projection,
      sort,
      skip,
      limit,
      page = 1,
      pageSize = 10,
      search
    } = {}) => {
  try {
    let searchQuery = baseFilter;
    const searchField = ["name", "description", "tags", "status", "uploadedBy.name", "uploadedBy.email", "category.name", "category.description", "category.slug"];
    if (search || search?.length > 0) {
      searchField.map(p => {
        searchQuery[p] = { $regex: search, $project: "i" }
      });
    }

    const currentPage = Math.max(1, parseInt(page));
    const currentPageSize = Math.max(1, parseInt(pageSize));
    const recordsToSkip = skip ?? (currentPage - 1) * currentPageSize;
    const recordsLimit = limit ?? currentPageSize;

    const [errors, result] = await findAssets(searchQuery, projection, sort, recordsLimit, recordsToSkip);

    const [results, totalRecords] = await findTotalAssets(searchQuery);
    if (errors) {
      return [errors, data];
    }

    const totalPages = Math.ceil(totalRecords / recordsLimit);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;
    const data = {
      items: result,
      pagination: {
        currentPage,
        pageSize: recordsLimit,
        totalItems: totalRecords,
        totalPages,
        hasNextPage: hasNext,
        hasPrevPage: hasPrevious,
        nextPage: hasNext ? currentPage + 1 : null,
        prevPage: hasPrevious ? currentPage - 1 : null
      }
    };
    
    return [false, data];
  } catch (error) {
    return [error, false];
  }
};

const assetsRepository = {
  insertOne,
  findById,
  findOne,
  findMany,
  getManyWithPagination,
  updateOne,
  findOneAndUpdate,
  deleteOne,
  count,
  aggregate,
};


export default assetsRepository;
