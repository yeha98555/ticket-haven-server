export const enum StatusCode {
  SUCCESS = '0000', // 200
  FORBIDDEN = '0001', // 401
  FAIL = '0002', // 400
  NOT_FOUND = '0003', // 404
  ACCT_OR_PWD_WRONG = '0004',
  ORDER_EXCEEDS_SEATS_LIMIT = '0005',
  NO_AVAILABLE_SEATS = '0006',
  ORDER_CANNOT_ADD_TICKETS = '0007',
  ORDER_CANNOT_BE_PAID = '0008',
}
