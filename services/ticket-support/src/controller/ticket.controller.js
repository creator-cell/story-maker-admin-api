import ticketRepository from "../respositories/ticketRepository.js";

// Create Role
export const createTicket = async (req, res) => {
  try {
    const [error, response] = await ticketRepository.insertOne(req.body);
    if (response) {
      res.status(201).json({
        message: "Ticket created successfully.",
        ticket: response,
      });
    } else {
      res.status(400).json({
        message: "Something went wrong",
        ticket: error,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAllTicket = async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    search,

    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const filters = {};

  const result = await ticketRepository.getManyWithPagination(
    {},
    {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      search,
      filters,
      sort,
    }
  );

  if (result.error) {
    return res
      .status(500)
      .json({ message: "Error fetching users", error: result.error });
  }

  res.json(result.data);
};

export const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const [error, user] = await ticketRepository.findOneById(id);
    if (error || !user) {
      return res.status(404).json({ message: "ticket not found" });
    }
    await user.populate("moderator");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const [error, user] = await ticketRepository.findOneAndUpdate(
      { _id: id },
      updateData
    );
    if (error || !user) {
      return res.status(400).json({ message: "ticket update_failed" });
    }

    res.json({ message: "ticket updated", user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteTicket = async (req, res) => {
  const { id } = req.params;

  try {
    const [error, result] = await userRepository.deleteOne({ _id: id });
    if (error || result.deletedCount === 0) {
      return res.status(400).json({ message: "failed to delete user" });
    }

    res.json({ message: "user deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
