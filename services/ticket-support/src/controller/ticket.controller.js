import ticketRepository from "../respositories/ticketRepository.js";
import Ticket from "../models/ticket.model.js";
import sendMail from "../utils/mailer.js";
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
    const [error, ticket] = await ticketRepository.findOneById(id);
    if (error || !ticket) {
      return res.status(404).json({ message: "ticket not found" });
    }

    await ticket.populate([
      { path: "moderator", select: "name" },
      { path: "messages.sender", select: "name" },
    ]);

    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const updateTicket = async (req, res) => {
  const { id } = req.params;
  let { messages, sender, role, ...otherUpdates } = req.body;

  try {
    if (typeof messages === "string") {
      messages = [{ message: messages }];
    } else if (messages && !Array.isArray(messages)) {
      messages = [messages];
    }

    let newMessage = null;

    if (messages && messages.length > 0) {
      newMessage = messages[0];
    }

    if (newMessage) {
      newMessage = {
        ...newMessage,
        sender: sender,
        role: role || "user",
        sentAt: newMessage.sentAt || new Date(),
      };
    }

    if (req.file) {
      if (!newMessage) {
        newMessage = {
          sender: req.user?._id,
          role: "user",
          sentAt: new Date(),
        };
      }
      newMessage.image = `/uploads/chat/${req.file.filename}`;
    }

    const updateQuery = { ...otherUpdates };
    if (newMessage) {
      updateQuery.$push = { messages: newMessage };
    }

    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: id },
      updateQuery,
      { new: true }
    )
      .populate("messages.sender", "name email")
      .populate("userId");

    if (!updatedTicket) {
      return res.status(400).json({ message: "ticket update_failed" });
    }
    const userEmail = updatedTicket.userId?.email;

    if (userEmail) {
      await sendMail({
        to: userEmail,
        subject: "Your support ticket has been updated",
        html: `
          <p>Hi ${updatedTicket.userId.name},</p>
          <p>Your ticket <strong>#${
            updatedTicket._id
          }</strong> has a new update:</p>
          <blockquote>${
            newMessage?.message || "See your ticket for details."
          }</blockquote>
          <p><a href="https://yourdomain.com/tickets/${
            updatedTicket._id
          }">View Ticket</a></p>
          <p>Best regards,<br/>Support Team</p>
        `,
      });
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
