import { isNumber, isString } from "lodash";
import type { NodeType, RemirrorJSON, ProsemirrorNode } from "@remirror/core-types";

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

export type NodeMigration = (content?: ProsemirrorNode[]) => ProsemirrorNode[] | undefined

export type MigrationDefinition = Record<
  NodeType,
  (node: ProsemirrorNode, recurse: NodeMigration) => ProsemirrorNode | undefined
>

export type MigrationManifest = Record<
  number,
  MigrationDefinition
>;

function migrateNodes(
  doc: RemirrorJSON,
  migrationDef: MigrationDefinition
): RemirrorJSON {
  function migrateNode(
    acc: ProsemirrorNode[],
    node: ProsemirrorNode
  ): ProsemirrorNode[] {
    const migrateNodeArray: NodeMigration = (content?) => {
      return content?.reduce(migrateNode, []);
    };

    const nodeTypeMigrator = migrationDef[node.type];
    const modified = nodeTypeMigrator?.(node, migrateNodeArray);
    if (modified) {
      return acc.concat(modified);
    }

    if (node.content) {
      return acc.concat({
        ...node,
        content: node.content.reduce(migrateNode, [])
      });
    }

    return acc.concat(node);
  }

  return {
    ...doc,
    content: doc.content!.reduce(migrateNode, [])
  };
}

const NUMERIC_REGEX = /^\d+(?:\.\d+)?$/;

function getInboundVersion (doc: RemirrorJSON) {
  const version = doc.attrs?.version ?? 0;

  if (isNumber(version)) {
    return version;
  }

  if (isString(version)) {
    const numberMatch = version.match(NUMERIC_REGEX);

    if (numberMatch) {
      return Number.parseFloat(numberMatch[0] as string);
    }
  }

  return null;
}

export function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
) {
  const { debug } = config || {};

  return function (doc: RemirrorJSON, currentVersion: number): RemirrorJSON {
    const inboundVersion = getInboundVersion(doc);

    if (!isNumber(inboundVersion)) {
      console.error(
        "prosemirror-migration: `doc.attrs.version` must be a parseable number, undefined or null"
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
      .map((ver) => parseFloat(ver))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b);

    if (debug) {
      console.log("prosemirror-migration: migrationKeys", migrationKeys);
    }

    return migrationKeys.reduce((state, versionKey) => {
      if (debug) {
        console.log(
          "prosemirror-migration: running migration for versionKey",
          versionKey
        );
      }

      const { attrs = {} } = doc;
      attrs.version = versionKey;
      doc.attrs = attrs;

      return migrateNodes(state, migrations[versionKey]);
    }, doc);
  };
}
