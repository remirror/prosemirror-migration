import type { ProsemirrorNode } from "@remirror/core-types";
import type { MigrationDefinition } from "../src";

const groupListItems = (content: ProsemirrorNode[]): ProsemirrorNode[][] | undefined => {
  if (content?.length < 1) return;

  return content.reduce((acc, node) => {
    if (acc.length && acc[acc.length - 1][0].attrs.hasCheckbox === node.attrs.hasCheckbox) {
      acc[acc.length - 1].push(node);
    } else {
      acc.push([node]);
    }
    return acc;
  }, []);
}

const toTaskLists: MigrationDefinition = {
  bulletList: ({ type, content, ...rest }, migrate) => {
    const grouped = groupListItems(content);
    return grouped?.map((group) => ({
      type: group[0].attrs.hasCheckbox ? "taskList" : "bulletList",
      content: migrate(group),
      ...rest
    }));
  },
  orderedList: ({ type, content, attrs = {}, ...rest }, migrate) => {
    const { order, ...restAttrs } = attrs;
    const taskListAttrs =  Object.keys(restAttrs).length ? restAttrs : undefined

    const grouped = groupListItems(content);
    return grouped?.map((group) => ({
      type: group[0].attrs.hasCheckbox ? "taskList" : "orderedList",
      attrs: group[0].attrs.hasCheckbox ? taskListAttrs : attrs,
      content: migrate(group),
      ...rest
    }));
  },
  listItem: ({ type, content, attrs = {}, ...rest }, migrate) => {
    const { hasCheckbox, checked, closed, nested, ...restAttrs } = attrs;
    if (hasCheckbox) {
      return {
        type: "taskListItem",
        content: migrate(content),
        ...rest,
        attrs: {
          checked,
          ...restAttrs
        }
      };
    } else {
      return {
        type: "listItem",
        content: migrate(content),
        ...rest,
        attrs: {
          closed,
          nested,
          ...restAttrs
        }
      };
    }
  }
}

export default toTaskLists;
