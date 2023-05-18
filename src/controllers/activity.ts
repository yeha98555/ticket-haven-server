import activityService from '@/services/activity';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';

const activityController = {
  searchActivities: catchAsyncError(async (req, res) => {
    const { activities, ...pagination } =
      await activityService.searchActivities(req.query as any);

    res.json(
      Body.success(activities.map((v) => v.toJSON())).pagination(pagination),
    );
  }),
};

export default activityController;
