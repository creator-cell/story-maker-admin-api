import { createBaseRepository } from './baseRepository.js';
import Ticket from '../models/ticket.model.js';

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
  getManyWithPagination
} = createBaseRepository(Ticket);


const findByName = async (name) => findOne({ name });

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
};

export default ticketRepository;
