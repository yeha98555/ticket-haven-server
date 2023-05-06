import { ZodSchema } from 'zod';

const toValidate = (schema: ZodSchema) => (v: unknown) => {
  schema.parse(v);
  return;
};

export default toValidate;
