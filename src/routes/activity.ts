import { Router } from 'express';
import z from 'zod';
import {
  processRequestQuery,
  validateRequestParams,
} from '@/middleware/paramsValidator';
import activityController from '@/controllers/activity';
import parseSortString from '@/utils/parseSortString';
import { Region } from '@/enums/region';

const activityRouter = Router();

activityRouter.get(
  '/',
  processRequestQuery<any>(
    z.object({
      page: z.coerce.number(),
      pageSize: z.coerce.number(),
      region: z
        .string()
        .transform((v) => v && parseInt(v))
        .pipe(z.nativeEnum(Region))
        .optional(),
      startAfter: z.coerce.date().optional(),
      startBefore: z.coerce.date().optional(),
      sellStartAfter: z.coerce.date().optional(),
      sellStartBefore: z.coerce.date().optional(),
      q: z.string().optional(),
      sort: z
        .string()
        .optional()
        .transform((v) => v && parseSortString(v)),
    }),
  ),
  activityController.searchActivities,
);

activityRouter.get(
  '/:activityId',
  validateRequestParams(z.object({ activityId: z.string() })),
  activityController.getActivityInfo,
);

export default activityRouter;
