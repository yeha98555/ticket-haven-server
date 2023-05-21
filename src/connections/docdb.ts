import mongoose from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import fs from 'fs';
import AWS from 'aws-sdk';

mongoose.plugin(mongooseLeanVirtuals);

AWS.config.update({ region: 'us-east-2' });
const secretsManager = new AWS.SecretsManager();

secretsManager.getSecretValue({ SecretId: 'db_credentials' }, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  let secret: string;
  if ('SecretString' in data) {
    secret = data.SecretString as string;
  } else {
    const buff = Buffer.from(data.SecretBinary as string, 'base64');
    secret = buff.toString('ascii');
  }

  const credentials = JSON.parse(secret);

  // Write the certificate to a temporary file
  const tempCertFile = '/tmp/rds-combined-ca-bundle.pem';
  fs.writeFileSync(tempCertFile, credentials.certificate);

  // Connect to the DocumentDB
  const connectionUri = `mongodb://${credentials.username}:${credentials.password}@${process.env.MONGODB_ENDPOINT}:27017/${process.env.MONGODB_DATABASE}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
  mongoose.connect(connectionUri, {
    sslValidate: true,
    sslCA: tempCertFile
  }).then(() => {
    console.log("Connected to DocumentDB");
  }).catch((error) => {
    console.error("Failed to connect to DocumentDB", error);
  });
});
