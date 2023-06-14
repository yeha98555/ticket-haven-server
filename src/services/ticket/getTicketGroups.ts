import { Activity } from '@/models/activity';
import TicketModel from '@/models/ticket';
import { Types } from 'mongoose';
import '@/connections';

const getTicketGroups = async ({
  userId,
  page,
  pageSize,
  isValid,
}: {
  userId: string;
  page: number;
  pageSize: number;
  isValid: boolean;
}) => {
  const result = await queryTicketGroups(userId, page, pageSize, isValid);

  const ticketGroups = result.results.map(
    ({ _id, activity, tickets: _tickets }) => {
      const event = activity.events.find((e) => e._id?.equals(_id));

      const tickets = _tickets.map((t) => {
        const area = activity.areas.find((a) => a._id?.equals(t.area_id));
        const subArea = area?.subareas.find((a) => a._id?.equals(t.subarea_id));
        return {
          ticketNo: t.ticket_no,
          orderId: t.order_id,
          areaId: t.area_id,
          subareaId: t.subarea_id,
          areaName: area?.name,
          subArea: subArea?.name,
          row: t.row,
          seat: t.seat,
          isUsed: t.is_used,
          isShared: t.is_shared,
          sharedBy: t.shared_by,
        };
      });

      return {
        activity: {
          id: activity._id,
          eventId: _id,
          name: activity.name,
          coverImgUrl: activity.cover_img_url,
          startAt: event?.start_at,
          endAt: event?.end_at,
          address: activity.address,
          location: activity.location,
        },
        tickets,
      };
    },
  );

  return {
    page,
    pageSize,
    totalCount: result.totalCount,
    totalPages: Math.floor(result.totalCount / pageSize) || 1,
    ticketGroups,
  };
};

type QueryResult = {
  results: {
    _id: Types.ObjectId;
    activity: Activity;
    tickets: {
      ticket_no: string;
      order_id: Types.ObjectId;
      area_id: Types.ObjectId;
      subarea_id: Types.ObjectId;
      row: number;
      seat: number;
      is_used: boolean;
      is_shared: boolean;
      shared_by: Types.ObjectId;
    }[];
  }[];
  totalCount: { count: number }[];
};

async function queryTicketGroups(
  userId: string,
  page: number,
  pageSize: number,
  isValid: boolean,
) {
  const validFilter = isValid
    ? {
        $lt: [new Date(), '$activity.end_at'],
      }
    : {
        $gte: [new Date(), '$activity.end_at'],
      };

  const result = (
    await TicketModel.aggregate<QueryResult>([
      {
        $match: {
          $expr: {
            $or: [
              {
                $eq: ['$user_id', new Types.ObjectId(userId)],
              },
              {
                $eq: ['$shared_by', new Types.ObjectId(userId)],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activity_id',
          foreignField: '_id',
          as: 'activities',
        },
      },
      {
        $addFields: {
          activity: {
            $first: '$activities',
          },
        },
      },
      {
        $match: {
          $expr: validFilter,
        },
      },
      {
        $group: {
          _id: '$event_id',
          activity: {
            $first: '$activity',
          },
          tickets: {
            $push: {
              ticket_no: '$ticket_no',
              order_id: '$order_id',
              area_id: '$area_id',
              subarea_id: '$subarea_id',
              row: '$row',
              seat: '$seat',
              is_used: '$is_used',
              shared_by: '$shared_by',
              is_shared: {
                $ne: ['$user_id', new Types.ObjectId(userId)],
              },
            },
          },
        },
      },
      {
        $facet: {
          results: [
            {
              $skip: (page - 1) * pageSize,
            },
            {
              $limit: pageSize,
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ])
  )[0];

  return {
    results: result.results,
    totalCount: result.totalCount[0]?.count || 0,
  };
}

export default getTicketGroups;
