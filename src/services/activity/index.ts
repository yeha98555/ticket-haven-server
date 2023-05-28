import ActivityModel from '@/models/activity';
import searchActivities from './searchActivities';
import { NotFoundException } from '@/exceptions/NotFoundException';
import TicketModel from '@/models/ticket';

const activityService = {
  searchActivities,

  getActivityInfo: async (id: string) => {
    const activity = await ActivityModel.findById(id).select('-__v -create_at -update_at -deleted_at -seat_small_img_url -region -areas -events.qrcode_verify_link -events.create_at -events.update_at');
    if (!activity) throw new NotFoundException();

    // Pre-convert event IDs to strings for subsequent queries and comparisons
    const eventIds = activity.events.map(event => event._id!.toString());

    // Fetch purchased seats from the database
    const purchasedSeats = await TicketModel.aggregate([
      {
        $match: {
          event_id: { $in: eventIds },
        }
      },
      {
        $group: {
          _id: '$event_id',
          purchasedSeats: { $sum: 1 }
        }
      }
    ]);

    // Convert purchasedSeats to a map for easier lookup
    const purchasedSeatsMap = purchasedSeats.reduce((acc, { _id, purchasedSeats }) => ({
      ...acc,
      [_id.toString()]: purchasedSeats,
    }), {});

    const returnEvents = activity.events.map((e) => {
      const eventId = e._id!.toString();
      return {
        id: eventId,
        startTime: e.start_at,
        endTime: e.end_at,
        sellStartTime: e.sell_at,
        sellEndTime: e.sellend_at,
        soldOut: purchasedSeatsMap[eventId] === activity.seat_total,
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
      seatMapUrl: activity.seat_big_img_url,
      events: returnEvents,
    };
  },
};

export default activityService;
