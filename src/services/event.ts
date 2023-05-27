import { NotFoundException } from "@/exceptions/NotFoundException";
import ActivityModel from "@/models/activity";
import { Types } from "mongoose";

const eventService = {
  getSeatInfo: async (eventId: string) => {
    const activity = await ActivityModel.findOne({
      'events._id': new Types.ObjectId(eventId)
    }).select([
      'seat_small_img_url',
      'areas'
    ]);

    if (!activity) throw new NotFoundException();

    // TODO: filter purchased seats

    return {
      seat_small_img_url: activity.seat_small_img_url,
      seats: activity.areas.map(area => ({
        id: area._id,
        name: area.name,
        price: area.price,
        subAreas: area.subareas.map(subarea => ({
          id: subarea._id,
          name: subarea.name,
          remainingSeats: subarea.rows.reduce((acc, cur) => acc + cur, 0),
        })),
      })),
    };
  },
};

export default eventService;

