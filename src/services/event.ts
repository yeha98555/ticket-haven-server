import { NotFoundException } from "@/exceptions/NotFoundException";
import ActivityModel from "@/models/activity";
import SeatReservationModel from "@/models/seatReservation";

const eventService = {
  getSeatInfo: async (eventId: string) => {
    const activity = await ActivityModel.findOne({
      'events._id': eventId
    }).select([
      'activity._id',
      'seat_small_img_url',
      'areas'
    ]);

    if (!activity) throw new NotFoundException();

    // Fetch reserved seats from the database
    const reservedSeats = await SeatReservationModel.aggregate([
      {
        $match: {
          'seats.subarea_id': { $in: activity.areas.flatMap(area => area.subareas.map(subarea => subarea._id)) },
        }
      },
      {
        $unwind: '$seats',
      },
      {
        $group: {
          _id: '$seats.subarea_id',
          reservedSeats: { $sum: 1 }
        }
      }
    ]);

    // Convert reservedSeats to a map for easier lookup
    const reservedSeatsMap = reservedSeats.reduce((acc, { _id, reservedSeats }) => {
      acc[_id.toString()] = reservedSeats;
      return acc;
    }, {});

    // Generate seats structure and calculate availableSeats
    const seats = activity.areas.map(area => ({
      id: area._id,
      name: area.name,
      price: area.price,
      subAreas: area.subareas.map(subarea => {
        const totalSeats = subarea.rows.reduce((acc, cur) => acc + cur, 0);
        const reserved = subarea._id ? (reservedSeatsMap[subarea._id.toString()] || 0) : 0;
        return {
          id: subarea._id,
          name: subarea.name,
          remainingSeats: totalSeats - reserved,
          color: subarea.color,
        };
      }),
    }));

    return {
      activityId: activity._id,
      seatImgUrl: activity.seat_small_img_url,
      seats: seats,
    };
  },
};

export default eventService;

