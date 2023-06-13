import checkIn from './checkIn';
import generateCheckInToken from './generateCheckInToken';
import generateInspectorToken from './generateInspectorToken';
import getCheckInInfo from './getCheckInInfo';

const checkInService = {
  generateCheckInToken,
  generateInspectorToken,
  getCheckInInfo,
  checkIn,
};

export default checkInService;
