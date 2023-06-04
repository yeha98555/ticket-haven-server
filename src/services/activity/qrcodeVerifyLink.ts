import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import ActivityModel from '@/models/activity';
import { NotFoundException } from '@/exceptions/NotFoundException';

const generateVerifyLink = async (eventId: string | Types.ObjectId) => {
  const activity = await ActivityModel.findOne({})
    .where('events._id')
    .equals(eventId);
  const event = activity?.events.id(eventId);
  if (!activity || !event) throw new NotFoundException();

  const linkId = uuidv4();
  event.qrcode_verify_link = linkId;

  await activity.save();

  return event.qrcode_verify_link;
};

export default generateVerifyLink;
