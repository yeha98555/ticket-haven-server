import mongoose from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import camelizeKeysPlugin from '@/models/plugins/camelizeKeys';

mongoose.plugin(mongooseLeanVirtuals);
mongoose.plugin(camelizeKeysPlugin, { camelize: true });
