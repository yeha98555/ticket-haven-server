export const successBody = ({
  status = '0000',
  message = 'success',
  data,
  page,
  pageSize,
  totalCount,
  totalPages,
}: {
  status?: string;
  message?: string;
  data: unknown;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}) => {
  return {
    status,
    message,
    data,
    page,
    pageSize,
    totalCount,
    totalPages,
  };
};
