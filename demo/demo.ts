import { createMigrate, MigrationManifest } from "../src";
import { migrateDoc } from "./v1-task-list";

const migrations: MigrationManifest = {
  0: (doc) => {
    return doc;
  },
  1: (doc) => {
    const newDoc = migrateDoc(doc);
    newDoc.attrs = { ...newDoc.attrs, version: 1 };
    return newDoc;
  },
};

export const migrate = createMigrate(migrations, { debug: true });
