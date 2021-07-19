import { createMigrate, MigrationManifest } from "../src";
import toTaskLists from "./v1-task-list";
import toEmojiCallouts from "./v2-emoji-callouts";

const migrations: MigrationManifest = {
  0: {
    doc: node => node
  },
  1: toTaskLists,
  2: toEmojiCallouts
};

export const migrate = createMigrate(migrations, { debug: true });
