import { Region } from '@/enums/region';
import ActivityModel from '@/models/activity';
import { SortRules } from '@/utils/parseSortString';
import { decamelize } from 'humps';
import { isNotNil } from 'ramda';
import * as d from 'date-fns';
import { PipelineStage } from 'mongoose';

const aggregateStages: PipelineStage[] = [
  {
    $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'activity_id',
      pipeline: [
        {
          $project: {
            seats: 1,
          },
        },
      ],
      as: 'orders',
    },
  },
  {
    $unwind: {
      path: '$orders',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      order_ticket_count: {
        $size: {
          $ifNull: ['$orders.seats', []],
        },
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      ticket_count: {
        $sum: '$order_ticket_count',
      },
      activity_data: {
        $first: '$$ROOT',
      },
    },
  },
  {
    $addFields: {
      seats: '$activity_data.areas.subareas.rows',
    },
  },
  {
    $unwind: {
      path: '$seats',
    },
  },
  {
    $unwind: {
      path: '$seats',
    },
  },
  {
    $addFields: {
      subarea_count: {
        $sum: '$seats',
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      seat_count: {
        $sum: '$subarea_count',
      },
      name: {
        $first: '$$ROOT.activity_data.name',
      },
      cover_img_url: {
        $first: '$$ROOT.activity_data.cover_img_url',
      },
      start_at: {
        $first: '$$ROOT.activity_data.start_at',
      },
      end_at: {
        $first: '$$ROOT.activity_data.end_at',
      },
      sell_at: {
        $first: '$$ROOT.activity_data.sell_at',
      },
      location: {
        $first: '$$ROOT.activity_data.location',
      },
      region: {
        $first: '$$ROOT.activity_data.region',
      },
      ticket_count: {
        $first: '$ticket_count',
      },
    },
  },
  {
    $addFields: {
      sold_out: {
        $cond: {
          if: {
            $eq: ['$ticket_count', '$seat_count'],
          },
          then: true,
          else: false,
        },
      },
    },
  },
  {
    $unset: ['ticket_count', 'seatCount'],
  },
  {
    $sort: {
      sell_at: 1,
      sold_out: 1,
    },
  },
];

const searchActivities = async ({
  page,
  pageSize,
  region,
  startAfter,
  startBefore,
  q,
  sort,
}: {
  page: number;
  pageSize: number;
  region?: Region;
  startAfter?: Date;
  startBefore?: Date;
  q?: string;
  sort?: SortRules;
}) => {
  const filter: {
    region?: Region;
    start_at?: { $gte?: Date; $lt?: Date };
    name?: { $regex: string };
  } = {};

  if (isNotNil(region)) {
    filter.region = region;
  }
  if (startAfter) {
    filter.start_at = { $gte: startAfter };
  }
  if (startBefore) {
    filter.start_at = {
      ...(filter.start_at || {}),
      $lt: d.add(startBefore, { days: 1 }),
    };
  }

  if (q) {
    const exp =
      '.*' +
      q
        .split(' ')
        .map((s) => `(?=.*${s})`)
        .join('') +
      '.*';
    filter.name = { $regex: exp };
  }

  const sortRule: { [key: string]: 1 | -1 } = {};
  sort?.forEach((r) => {
    const field = decamelize(r[0]);
    sortRule[field] = r[1] === '-' ? -1 : 1;
  });

  const activities = await ActivityModel.aggregate([
    { $match: filter },
    ...aggregateStages,
    {
      $sort: sortRule,
    },
    {
      $skip: (page - 1) * pageSize,
    },
    {
      $limit: pageSize,
    },
  ]);

  const totalCount = await ActivityModel.countDocuments(filter);
  const totalPages = Math.floor(totalCount / pageSize) || 1;

  // console.log({
  //   page,
  //   pageSize,
  //   totalCount,
  //   totalPages,
  //   activities: activities.map((v) => ({
  //     id: (v.toJSON() as any).id,
  //     startAt: v.start_at,
  //     endAt: v.end_at,
  //   })),
  // });

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    activities,
  };
};

// activityService.searchActivities({
//   page: 1,
//   pageSize: 10,
// region: 0,
// startAt: new Date('2023-05-21'),
// endAt: new Date('2023-05-21'),
//   sort: parseSortString('-startAt, -endAt'),
// });

export default searchActivities;
