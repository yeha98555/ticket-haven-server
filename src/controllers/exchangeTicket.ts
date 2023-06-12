import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response } from 'express';
import shareTicketService from '@/services/shareTicket';

const exchangeTicketController = {
  exchangeTicket: catchAsyncError(async (req: Request, res: Response) => {
    const { ticketNo, shareCode } = req.body as {
      ticketNo: string;
      shareCode: string;
    };
    const result = await shareTicketService.exchangeTicket(
      req.userId!,
      ticketNo,
      shareCode,
    );
    res.json(Body.success(result));
  }),
};

export default exchangeTicketController;
