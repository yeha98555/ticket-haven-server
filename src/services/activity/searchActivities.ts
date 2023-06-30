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
        $sum: {
          $multiply: [
            '$subarea_count',
            {
              $size: '$activity_data.events',
            },
          ],
        },
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
];

const searchActivities = async ({
  page,
  pageSize,
  region,
  startAfter,
  startBefore,
  sellStartBefore,
  sellStartAfter,
  q,
  sort,
}: {
  page: number;
  pageSize: number;
  region?: Region;
  startAfter?: Date;
  startBefore?: Date;
  sellStartBefore?: Date;
  sellStartAfter?: Date;
  q?: string;
  sort?: SortRules;
}) => {
  const filter: {
    region?: Region;
    start_at?: { $gte?: Date; $lt?: Date };
    sell_at?: { $gte?: Date; $lt?: Date };
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
  if (sellStartAfter) {
    filter.sell_at = { $gte: sellStartAfter };
  }
  if (sellStartBefore) {
    filter.sell_at = {
      ...(filter.sell_at || {}),
      $lt: d.add(sellStartBefore, { days: 1 }),
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

  let sortRule: { [key: string]: 1 | -1 } | undefined;
  sort?.forEach((r) => {
    const field = decamelize(r[0]);
    !sortRule && (sortRule = {});
    sortRule[field] = r[1] === '-' ? -1 : 1;
  });

  const activities = await ActivityModel.aggregate(
    [
      { $match: filter },
      ...aggregateStages,
      sortRule && {
        $sort: sortRule,
      },
      {
        $skip: (page - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ].filter(Boolean) as PipelineStage[],
  );

  const totalCount = await ActivityModel.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    activities,
  };
};

export default searchActivities;
