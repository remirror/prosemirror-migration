import { createMigrate, MigrationManifest } from "../src";
import toTaskLists from "./v1-task-list";

const migrations: MigrationManifest = {
  0: {
    doc: node => node
  },
  1: toTaskLists
};

export const migrate = createMigrate(migrations, { debug: true });
