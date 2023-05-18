import '../registerMongoosePlugins';
import '@/connections';
import { Region } from '@/enums/region';
import ActivityModel from '@/models/activity';
import { SortRules } from '@/utils/parseSortString';
import { decamelize } from 'humps';
import { isNotNil } from 'ramda';

const activityService = {
  searchActivities: async ({
    page,
    pageSize,
    region,
    startAt,
    endAt,
    q,
    sort,
  }: {
    page: number;
    pageSize: number;
    region?: Region;
    startAt?: Date;
    endAt?: Date;
    q?: string;
    sort?: SortRules;
  }) => {
    const filter: {
      region?: Region;
      start_at?: { $gt: Date };
      end_at?: { $lt: Date };
    } = {};

    if (isNotNil(region)) {
      filter.region = region;
    }
    if (startAt) {
      filter.start_at = { $gt: startAt };
    }
    if (endAt) {
      filter.end_at = { $lt: endAt };
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

    return {
      page,
      pageSize,
      totalCount,
      totalPages,
      activities,
    };
  },
};

export default activityService;
