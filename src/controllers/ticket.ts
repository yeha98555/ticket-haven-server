import catchAsyncError from '@/utils/catchAsyncError';
import ticketService from '@/services/ticket';
import { Body } from '@/utils/response';
import { Request, Response } from 'express';

const ticketController = {
  getTickets: catchAsyncError(async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10, isValid = 1 } = req.query;
    const { tickets, ...pagination } = await ticketService.getAllTickets({
      userId: req.userId!,
      isValid: Boolean(+isValid),
      page: Number(page),
      pageSize: Number(pageSize),
    });
    res.json(Body.success(tickets).pagination(pagination));
  }),
  createTicketCode: catchAsyncError(async (req: Request, res: Response) => {
    const { ticketNo } = req.body;
    const token = await ticketService.createTicketCode(req.userId!, ticketNo);
    res.json(Body.success(token));
  }),
};

export default ticketController;
