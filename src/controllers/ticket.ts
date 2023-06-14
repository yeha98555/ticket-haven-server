import catchAsyncError from '@/utils/catchAsyncError';
import ticketService from '@/services/ticket';
import { Body } from '@/utils/response';
import { Request, Response } from 'express';
import shareTicketService from '@/services/shareTicket';
import checkInService from '@/services/checkIn';

const ticketController = {
  getTickets: catchAsyncError(async (req: Request, res: Response) => {
    const { page = 1, pageSize = 10, isValid = 1 } = req.query;
    const { ticketGroups, ...pagination } = await ticketService.getTicketGroups(
      {
        userId: req.userId!,
        isValid: Boolean(+isValid),
        page: Number(page),
        pageSize: Number(pageSize),
      },
    );
    res.json(Body.success(ticketGroups).pagination(pagination));
  }),
  checkInToken: catchAsyncError(async (req: Request, res: Response) => {
    const { ticketNo } = req.params;
    const token = await checkInService.generateCheckInToken(
      req.userId!,
      ticketNo,
    );
    res.json(Body.success(token));
  }),
  generateShareCode: catchAsyncError(async (req: Request, res: Response) => {
    const { ticketNo } = req.params;
    const result = await shareTicketService.generateShareCode(
      req.userId!,
      ticketNo,
    );
    res.json(Body.success(result));
  }),
};

export default ticketController;
