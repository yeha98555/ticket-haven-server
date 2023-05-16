import { camelizeKeys } from 'humps';
import { Schema } from 'mongoose';

const camelizeKeysPlugin = (
  schema: Schema,
  opts: { camelize?: boolean } = {},
) => {
  schema.set('toJSON', {
    transform: (doc, ret, options) => {
      const camelize = options.camelize ?? opts.camelize;
      return camelize ? camelizeKeys(ret) : ret;
    },
  });
};

export default camelizeKeysPlugin;
