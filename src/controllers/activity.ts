import activityService from '@/services/activity';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { camelizeKeys } from 'humps';

const activityController = {
  searchActivities: catchAsyncError(async (req, res) => {
    const { activities, ...pagination } =
      await activityService.searchActivities(req.query as any);

    res.json(
      Body.success(
        camelizeKeys(JSON.parse(JSON.stringify(activities))),
      ).pagination(pagination),
    );
  }),
};

export default activityController;
