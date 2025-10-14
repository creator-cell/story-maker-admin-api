import templateRepository from "../respositories/templateRepository.js";
import Template from "../models/template.model.js";
// Create template
export const createTemplate = async (req, res) => {
  const { name, content, category, status, subCategory, user } = req.body;

  try {
    const [error, template] = await templateRepository.insertOne({
      name,
      content,
      category,
      status,
      subCategory,
      user,
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
export const trackTemplateUsage = async (req, res) => {
  const { templateId } = req.body;

  try {
    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { $inc: { templateCount: 1 } },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    console.log("Template usage count updated.");

    res.status(200).json({
      message: "Template usage count successfully updated",
      template: updatedTemplate,
    });
  } catch (err) {
    console.error("Error updating template usage count:", err);
    res.status(500).json({ message: "Error updating template usage count" });
  }
};

export const getAllTemplate = async (req, res) => {
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
      filters["user.name"] = regex;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const totalCount = await Template.countDocuments(filters);

    const templates = await Template.find(filters)
      .populate("user")
      .populate("category")
      .populate("subCategory")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize));

    res.json({
      data: templates,
      total: totalCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(totalCount / parseInt(pageSize)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

export const getTopTemplate = async (req, res) => {
  try {
    const templates = await Template.find({})
      .populate("user")
      .populate("category")
      .populate("subCategory")
      .sort({ templateCount: -1 })
      .limit(5);

    res.json({
      data: templates,
      total: templates.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching top templates", error });
  }
};

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
    await template.populate("category");
    await template.populate("subCategory");
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
  const { name, content, status, category, subCategory, user } = req.body;

  console.log("status", user);
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
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (subCategory) updateData.subCategory = subCategory;
    if (user) updateData.user = user;
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

export const cloneTemplate = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const [findError, existingTemplate] = await templateRepository.findOneById(
      id
    );

    if (findError) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Pass req.body data to repository
    const [error, result] = await templateRepository.cloneTemplate(payload);

    if (error) {
      return res.status(500).json({ message: error.message || error });
    }

    return res.json({
      message: "Template cloned successfully",
      data: result,
    });
  } catch (err) {
    console.error("Clone template error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
