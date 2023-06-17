import checkIn from './checkIn';
import generateCheckInToken from './generateCheckInToken';
import generateInspectorToken from './generateInspectorToken';
import getCheckInInfo from './getCheckInInfo';
import { getEventInfo } from './getEventInfo';

const checkInService = {
  generateCheckInToken,
  generateInspectorToken,
  getCheckInInfo,
  checkIn,
  getEventInfo,
};

export default checkInService;
