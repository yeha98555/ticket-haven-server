import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { Request, Response } from 'express';
import checkInService from '@/services/checkIn';

const checkInController = {
  getCheckInInfo: catchAsyncError(async (req: Request, res: Response) => {
    const { inspectorToken, ticketToken } = req.query as {
      inspectorToken: string;
      ticketToken: string;
    };
    const checkInInfo = await checkInService.getCheckInInfo(
      inspectorToken,
      ticketToken,
    );
    res.json(Body.success(checkInInfo));
  }),
  checkIn: catchAsyncError(async (req: Request, res: Response) => {
    const { inspectorToken, ticketToken } = req.body as {
      inspectorToken: string;
      ticketToken: string;
    };
    const result = await checkInService.checkIn(inspectorToken, ticketToken);
    res.json(Body.success(result));
  }),
  getEventInfo: catchAsyncError(async (req: Request, res: Response) => {
    const { authId } = req.params as {
      authId: string;
    };
    const eventInfo = await checkInService.getEventInfo(authId);
    res.json(Body.success(eventInfo));
  }),
};

export default checkInController;
