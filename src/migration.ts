import { isNumber } from "lodash";
import type { RemirrorJSON } from "@remirror/core-types";
import { migrateDoc } from "../demo/v1-task-list";

/**
 * https://discuss.prosemirror.net/t/schema-versioning-and-migrations/321/2
 *
 * > This was discussed at some length during the first summit in Berlin, and
 * > there the conclusion was that this is best left to the user. I.e. when you
 * > update your schema, write your own upgrade function, and if you’re able to,
 * > run it on all existing documents right away. If you’re not able to, store
 * > schema versions with your documents, and automatically upgrade them as they
 * > are read.
 *
 * > If you think part of this would benefit from library functionality, you can
 * > write it as a separate package. (Diffing schemas and then autogenerating
 * > upgrade code when possible, maybe.)
 *
 */

export type MigrationManifest = Record<
  number,
  (doc: RemirrorJSON) => RemirrorJSON
>;

export function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
) {
  const { debug } = config || {};

  return function (doc: RemirrorJSON, currentVersion: number): RemirrorJSON {
    const inboundVersion = doc.attrs?.version ?? 0;

    if (!isNumber(inboundVersion)) {
      console.error(
        "prosemirror-migration: `doc.attrs.version` must be a number, undefined or null"
      );
      return doc;
    }

    if (inboundVersion === currentVersion) {
      return doc;
    }

    if (inboundVersion > currentVersion) {
      console.error(
        "prosemirror-migration: downgrading version is not supported"
      );
      return doc;
    }

    const migrationKeys = Object.keys(migrations)
      .map((ver) => parseInt(ver))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b);

    if (debug) {
      console.log("prosemirror-migration: migrationKeys", migrationKeys);
    }

    const migratedDoc = migrationKeys.reduce((state, versionKey) => {
      if (debug) {
        console.log(
          "prosemirror-migration: running migration for versionKey",
          versionKey
        );
      }

      return migrations[versionKey](state);
    }, doc);

    return migratedDoc;
  };
}
