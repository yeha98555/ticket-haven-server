import checkInService from '@/services/checkIn';
import eventService from '@/services/event';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';

const eventController = {
  getSeatInfo: catchAsyncError(async (req, res) => {
    const seats = await eventService.getSeatInfo(req.params.eventId);
    res.json(Body.success(seats));
  }),
  generateCheckInVerifyToken: catchAsyncError(async (req, res) => {
    const token = await checkInService.generateVerifyToken(req.params.eventId);
    res.json(Body.success(token));
  }),
};

export default eventController;
