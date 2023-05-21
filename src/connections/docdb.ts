import mongoose from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import fs from 'fs';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

mongoose.plugin(mongooseLeanVirtuals);

const region = 'us-east-2';
const secretsManagerClient = new SecretsManagerClient({ region });

const command = new GetSecretValueCommand({ SecretId: 'db_credentials' });

secretsManagerClient.send(command).then(data => {
  let secret: string;
  if ('SecretString' in data) {
    secret = data.SecretString as string;
  } else {
    console.error("Binary secrets are not supported");
    return;
  }

  const credentials = JSON.parse(secret);

  // Write the certificate to a temporary file
  const tempCertFile = "/tmp/rds-combined-ca-bundle.pem";
  fs.writeFileSync(tempCertFile, credentials.certificate);

  // Connect to the DocumentDB
  const connectionUri = `mongodb://${credentials.username}:${credentials.password}@${process.env.MONGODB_ENDPOINT}:27017/${process.env.MONGODB_DATABASE}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
  mongoose.connect(connectionUri, {
    sslValidate: true,
    sslCA: tempCertFile,
  }).then(() => {
    console.log("Connected to DocumentDB");
  }).catch((error) => {
    console.error("Failed to connect to DocumentDB", error);
  });
}).catch(err => {
  console.error(err);
});
