import ActivityModel from '@/models/activity';
import searchActivities from './searchActivities';
import { NotFoundException } from '@/exceptions/NotFoundException';

const activityService = {
  searchActivities,

  getActivityInfo: async (id: string) => {
    const activity = await ActivityModel.findById(id);
    if (!activity) throw new NotFoundException();

    const returnEvents = activity.events.map((e) => {
      return {
        id: e._id,
        startTime: e.start_at,
        endTime: e.end_at,
        sellStartTime: e.sell_at,
        sellEndTime: e?.sellend_at,
      };
    });

    return {
      id: activity._id,
      name: activity.name,
      converImageUrl: activity.cover_img_url,
      startTime: activity.start_at,
      endTime: activity.end_at,
      location: activity.location,
      address: activity.address,
      content: activity.content,
      notice: activity.notice,
      seatMapUrl: activity.seat_small_img_url,
      events: returnEvents,
    }
  },
};

export default activityService;
