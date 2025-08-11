import templateRepository from "../respositories/templateRepository.js";

// Create template
export const createTemplate = async (req, res) => {
  const { name, content } = req.body;

  try {
    const [error, template] = await templateRepository.insertOne({
      name,
      content,
    });

    if (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    res.status(201).json({
      message: "template created successfully",
      template,
    });
  } catch (err) {
    console.error("Create template error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all Categories (with pagination + search)
export const getAllTemplate = async (req, res) => {
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

      const [error, result] = await templateRepository.getManyWithPagination(
        options
      );
      if (error) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      res.json({
        message: "Categories retrieved successfully",
        items: result.items,
        pagination: result.pagination,
      });
    } else {
      const [error, categories] = await templateRepository.findMany();
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

// Get template by ID
export const getTemplateById = async (req, res) => {
  const { id } = req.params;

  try {
    const [error, template] = await templateRepository.findOneById(id);
    if (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!template) {
      return res.status(404).json({ message: "template not found" });
    }

    res.json({
      message: "template retrieved successfully",
      template,
    });
  } catch (err) {
    console.error("Get template by ID error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    const [findError, existingtemplate] = await templateRepository.findOneById(
      id
    );
    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!existingtemplate) {
      return res.status(404).json({ message: "template not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (content) updateData.content = content;

    const [error, updatedtemplate] = await templateRepository.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );

    if (error || !updatedtemplate) {
      return res.status(400).json({ message: "template update failed" });
    }

    res.json({
      message: "template updated successfully",
      template: updatedtemplate,
    });
  } catch (err) {
    console.error("Update template error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    const [findError, existingtemplate] = await templateRepository.findOneById(
      id
    );
    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!existingtemplate) {
      return res.status(404).json({ message: "template not found" });
    }

    const [error, result] = await templateRepository.deleteOne({ _id: id });
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: "Failed to delete template" });
    }

    res.json({ message: "template deleted successfully" });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
