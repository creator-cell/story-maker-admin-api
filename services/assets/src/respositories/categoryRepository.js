import { createBaseRepository } from "./baseRepository.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";

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
} = createBaseRepository(Category);

const findByName = async (name) => findOne({ name });

/**
 * Removes an asset ID from a category's assets list.
 *
 * @param {String} categoryId - The ID of the category to update.
 * @param {String} assetsId - The ID of the asset to remove from the category.
 * 
 * @returns {Promise<[string|boolean, boolean]>} 
 * Returns a tuple where:
 *   - The first value is an error message or false if no error occurred.
 *   - The second value indicates success (true) or failure (false).
 *
 * The function:
 *   1. Validates the input IDs.
 *   2. Fetches the target category from the database.
 *   3. Filters out the specified asset ID from the category's assets.
 *   4. Saves the updated category.
 *   5. Handles and returns errors gracefully.
 */
const removeAssets = async (categoryId, assetsId) => {
  try {
    
    if (!categoryId || !assetsId) {
      return ["Invalid request", false]
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return ["Category not found", false];
    }

    const allAssets = category?.assets || [];

    const filterAssets = allAssets.filter(f => {
      return f?.toString() != assetsId?.toString();
    });

    category.assets = filterAssets;

    await category.save();

    return [false, true];

  } catch (error) {
    return [error, false];
  }
}

/**
 * Adds an asset ID to a category's assets list.
 *
 * @param {String} categoryId - The ID of the category to update.
 * @param {String} assetsId - The ID of the asset to add to the category.
 *
 * @returns {Promise<[string|boolean, boolean]>}
 * Returns a tuple where:
 *   - The first value is an error message or false if no error occurred.
 *   - The second value indicates success (true) or failure (false).
 *
 * The function:
 *   1. Validates the provided IDs.
 *   2. Retrieves the specified category from the database.
 *   3. Appends the asset ID to the category's assets array.
 *   4. Saves the updated category document.
 *   5. Returns a standardized success/error tuple.
 */
const addAsset = async (categoryId, assetsId) => {
  try {
    
    if (!categoryId || !assetsId) {
      return ["Invalid request", false];
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return ["Category not found", false];
    }

    const allAssets = category.assets || [];
    allAssets.push(assetsId);

    category.assets = allAssets;
    await category.save();

    return [false, true];

  } catch (error) {
    return [error, false];
  }
}

const categoryRepository = {
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
  addAsset,
  removeAssets
};

export default categoryRepository;
