import ticketRepository from "../respositories/ticketRepository.js";
import Ticket from "../models/ticket.model.js";
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
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      user,
      role,
    } = req.query;

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const filters = {};
    if (role === "user") {
      filters.userId = user;
    } else if (role === "moderator") {
      filters.moderator = user;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    let tickets = await Ticket.find(filters)
      .populate("userId")
      .populate("moderator")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize));

    if (search) {
      const regex = new RegExp(search, "i");
      tickets = tickets.filter(
        (t) =>
          regex.test(t.message || "") ||
          regex.test(t.status || "") ||
          regex.test(t.userId?.name || "")
      );
    }

    const totalCount = tickets.length;

    res.json({
      data: tickets,
      total: totalCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(totalCount / parseInt(pageSize)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

export const getAllModerator = async (req, res) => {
  const moderator = await ticketRepository.getAllModerator();
  res.send(moderator);
};

export const getModeratorTicket = async (req, res) => {
  const allModerator = await ticketRepository.getModeratorTicket(req.params.id);
  res.send(allModerator);
};

export const getUserTicket = async (req, res) => {
  const allModerator = await ticketRepository.getUserTicket(req.params.id);
  res.send(allModerator);
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

// export const updateTicket = async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;

//   try {
//     const [error, user] = await ticketRepository.findOneAndUpdate(
//       { _id: id },
//       updateData
//     );
//     if (error || !user) {
//       return res.status(400).json({ message: "ticket update_failed" });
//     }

//     res.json({ message: "ticket updated", user });
//   } catch (err) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { messages, ...otherUpdates } = req.body;

  try {
    const updatedTicket = await ticketRepository.findOneAndUpdate(
      { _id: id },
      {
        ...otherUpdates,
        ...(messages && { $push: { messages: { $each: messages } } }),
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(400).json({ message: "ticket update_failed" });
    }

    res.json({ message: "ticket updated", ticket: updatedTicket });
  } catch (err) {
    console.error(err);
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
