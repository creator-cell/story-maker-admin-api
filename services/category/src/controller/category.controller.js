import categoryRepository from "../respositories/categoryRepository.js";
import Category from "../models/category.model.js";
// Create Category
export const createCategory = async (req, res) => {
  const { name, description, parentCategory, assets, templates, slug } =
    req.body;

  try {
    const [findError, existingCategory] = await categoryRepository.findByName(
      name
    );
    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const [error, category] = await categoryRepository.insertOne({
      name,
      description,
      parentCategory: parentCategory,
      slug: slug,
      assets: assets || [],
      templates: templates || [],
    });

    if (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Something went wrong" });
    }

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all Categories (with pagination + search)
export const getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const filters = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filters["name"] = regex;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const totalCount = await Category.countDocuments(filters);

    const categories = await Category.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize));

    res.json({
      message: "Categories retrieved successfully",
      items: categories,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(totalCount / parseInt(pageSize)),
      },
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Get Category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const [error, category] = await categoryRepository.findOneById(id);
    if (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (err) {
    console.error("Get category by ID error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, parentCategory, assets, templates, slug } =
    req.body;

  try {
    const [findError, existingCategory] = await categoryRepository.findOneById(
      id
    );
    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (slug) updateData.slug = slug;
    if (description) updateData.description = description;
    if (parentCategory) updateData.parentCategory = parentCategory;
    if (assets) updateData.assets = assets;
    if (templates) updateData.templates = templates;

    const [error, updatedCategory] = await categoryRepository.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );

    if (error || !updatedCategory) {
      return res.status(400).json({ message: "Category update failed" });
    }

    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [findError, existingCategory] = await categoryRepository.findOneById(
      id
    );
    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const [error, result] = await categoryRepository.deleteOne({ _id: id });
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: "Failed to delete category" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
