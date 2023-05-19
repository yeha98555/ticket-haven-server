import '../registerMongoosePlugins';
import '@/connections';
import { Region } from '@/enums/region';
import ActivityModel from '@/models/activity';
import { SortRules } from '@/utils/parseSortString';
import { decamelize } from 'humps';
import { isNotNil } from 'ramda';
import * as d from 'date-fns';

const activityService = {
  searchActivities: async ({
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

    const activities = await ActivityModel.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('name cover_img_url start_at end_at sell_at location region')
      .sort(sortRule);

    const totalCount = await ActivityModel.countDocuments(filter);
    const totalPages = Math.floor(totalCount / pageSize) || 1;

    console.log({
      page,
      pageSize,
      totalCount,
      totalPages,
      activities: activities.map((v) => ({
        id: (v.toJSON() as any).id,
        startAt: v.start_at,
        endAt: v.end_at,
      })),
    });

    return {
      page,
      pageSize,
      totalCount,
      totalPages,
      activities,
    };
  },
};

// activityService.searchActivities({
//   page: 1,
//   pageSize: 10,
// region: 0,
// startAt: new Date('2023-05-21'),
// endAt: new Date('2023-05-21'),
//   sort: parseSortString('-startAt, -endAt'),
// });

export default activityService;
