import { NotFoundException } from "@/exceptions/NotFoundException";
import ActivityModel from "@/models/activity";
import TicketModel from "@/models/ticket";

const eventService = {
  getSeatInfo: async (eventId: string) => {
    const activity = await ActivityModel.findOne({
      'events._id': eventId
    }).select([
      'seat_small_img_url',
      'areas'
    ]);

    if (!activity) throw new NotFoundException();

    // Fetch purchased seats from the database
    const purchasedSeats = await TicketModel.aggregate([
      {
        $match: {
          subarea_id: { $in: activity.areas.flatMap(area => area.subareas.map(subarea => subarea._id)) },
        }
      },
      {
        $group: {
          _id: '$subarea_id',
          purchasedSeats: { $sum: 1 }
        }
      }
    ]);

    // Convert purchasedSeats to a map for easier lookup
    const purchasedSeatsMap = purchasedSeats.reduce((acc, { _id, purchasedSeats }) => {
      acc[_id.toString()] = purchasedSeats;
      return acc;
    }, {});

    // Generate seats structure and calculate availableSeats
    const seats = activity.areas.map(area => ({
      id: area._id,
      name: area.name,
      price: area.price,
      subAreas: area.subareas.map(subarea => {
        const totalSeats = subarea.rows.reduce((acc, cur) => acc + cur, 0);
        const purchased = subarea._id ? (purchasedSeatsMap[subarea._id.toString()] || 0) : 0;
        return {
          id: subarea._id,
          name: subarea.name,
          remainingSeats: totalSeats - purchased,
          color: subarea.color,
        };
      }),
    }));

    return {
      seatImgUrl: activity.seat_small_img_url,
      seats: seats,
    };
  },
};

export default eventService;

