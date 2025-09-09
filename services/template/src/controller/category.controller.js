import categoryRepository from "../respositories/categoryRepository.js";

// Create Category
export const createCategory = async (req, res) => {
  const {
    name,
    description,
    subCategories,
    assets,
    templates,
    parentCategory,
  } = req.body;

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
      subCategories: subCategories || [],
      assets: assets || [],
      templates: templates || [],
      parentCategory: parentCategory,
    });

    if (error) {
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
      page,
      pageSize,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    if (page || pageSize) {
      const options = {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortBy,
        sortOrder,
        search,
      };

      const [error, result] =
        await categoryRepository.getCategoriesWithPagination(options);
      if (error) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      res.json({
        message: "Categories retrieved successfully",
        items: result.items,
        pagination: result.pagination,
      });
    } else {
      const [error, categories] = await categoryRepository.findMany();
      if (error) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      res.json({
        message: "Categories retrieved successfully",
        categories,
      });
    }
  } catch (err) {
    console.error("Get all categories error:", err);
    res.status(500).json({ message: "Something went wrong" });
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
  const { name, description, subCategories, assets, templates } = req.body;

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
    if (description) updateData.description = description;
    if (subCategories) updateData.subCategories = subCategories;
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
