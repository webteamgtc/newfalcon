import { MongoClient, type Db } from "mongodb";

const options = {
  serverSelectionTimeoutMS: 10000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getConnectionUri(): string {
  const standardUri = process.env.MONGODB_URI_STANDARD?.trim();
  if (standardUri) {
    return standardUri;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = getConnectionUri();

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options)
      .connect()
      .catch((error) => {
        global._mongoClientPromise = undefined;
        throw error;
      });
  }

  return global._mongoClientPromise;
}

export async function getRegistrationDb(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB || "registration_data";
  return client.db(dbName);
}

export const REGISTRATION_COLLECTION =
  process.env.MONGODB_COLLECTION || "form";

export const STAFF_REGISTRATION_COLLECTION =
  process.env.MONGODB_STAFF_COLLECTION || "staff_registration";
