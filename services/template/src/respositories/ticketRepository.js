import { createBaseRepository } from "./baseRepository.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
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
} = createBaseRepository(Ticket);

const findByName = async (name) => findOne({ name });

const getAllModerator = async () => {
  const roleId = new mongoose.Types.ObjectId("68678f3d64744be0766a80f2");
  const getUser = await User.find({ role: roleId });
  return getUser;
};

const getModeratorTicket = async (id) => {
  const roleId = new mongoose.Types.ObjectId(id);
  const moderator = await Ticket.find({ moderator: roleId })
    .populate("moderator")
    .populate("userId");
  return moderator;
};

const getUserTicket = async (id) => {
  const userTicket = await Ticket.find({ userId: id })
    .populate("userId")
    .populate("moderator");
  return userTicket;
};
const ticketRepository = {
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
  getAllModerator,
  getModeratorTicket,
  getUserTicket,
};

export default ticketRepository;
