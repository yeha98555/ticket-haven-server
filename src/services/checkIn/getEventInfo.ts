import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';

export const getEventInfo = async (authId: string) => {
  const activity = await ActivityModel.findOne({
    'events.qrcode_verify_id': authId,
  });

  const event = activity?.events.find((e) => e.qrcode_verify_id === authId);

  if (!activity || !event) throw new NotFoundException();

  return {
    activityName: activity.name,
    location: activity.location,
    address: activity.address,
    coverImgUrl: activity.cover_img_url,
    eventId: event._id,
    startTime: event.start_at,
    endTime: event.end_at,
  };
};
