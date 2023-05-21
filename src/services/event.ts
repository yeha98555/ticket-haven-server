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

    return { activity };
  },
};

export default eventService;

