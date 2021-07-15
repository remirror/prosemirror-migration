import {flatten} from 'lodash'
import {RemirrorJSON} from '@remirror/core-types'
import {partitionArray} from './utils'

/**
 * Transfer a listItem node to a taskListItem node
 *
 * @param node The Prosemirror node. Ignore if it's not a listItem node.
 * @param forced If false, then the function will only transfer a listItem node with truthy attribute `hasCheckbox`.
 * @returns Transfered Prosemirror node.
 */
function listItemToTaskListItem(node: RemirrorJSON, forced: boolean): RemirrorJSON {
  if (node.type !== 'listItem') {
    return node
  }

  if (forced || node.attrs?.hasCheckbox) {
    const attrs = {...node.attrs}
    delete attrs['hasCheckbox']
    delete attrs['closed']
    delete attrs['nested']
    attrs.checked = !!attrs.checked

    return {
      ...node,
      attrs,
      type: 'taskListItem',
    }
  } else {
    const attrs = node.attrs
    if (attrs) {
      delete attrs['hasCheckbox']
      delete attrs['checked']
    }

    return node
  }
}

/**
 * Transfer a bulletList/orderedList node to a taskList node if its children is a taskListItem node.
 *
 * @param node The Prosemirror node. Ignore if it's not a bulletList node or orderedList node.
 * @returns Transfered Prosemirror node.
 */
export function listToTaskList(node: RemirrorJSON): RemirrorJSON[] {
  if (node.type !== 'bulletList' && node.type !== 'orderedList') {
    return [node]
  }

  const attrs = node.attrs
  if (attrs) {
    delete attrs['order']
    if (Object.keys(attrs).length === 0) {
      delete node.attrs
    }
  }

  const partitions = partitionNodesByType(node.content ?? [])

  const result = partitions.map((content) => {
    const isTaskList = content[0].type === 'taskListItem'

    return {
      ...node,
      type: isTaskList ? 'taskList' : node.type,
      content,
    }
  })

  return result
}

function partitionNodesByType(nodes: RemirrorJSON[]): RemirrorJSON[][] {
  return partitionArray(nodes, (node) => node.type)
}

function migrateNodes(nodes: RemirrorJSON[]): RemirrorJSON[] {
  // transfer the children (listItem) firstly and then transfer the parent (bulletList)
  for (const node of nodes) {
    if (node.content) {
      node.content = migrateNodes(node.content)
    }
  }

  let updatedNodes: RemirrorJSON[] = nodes.map((node) => {
    return listItemToTaskListItem(node, false)
  })

  updatedNodes = flatten(
    updatedNodes.map((node) => {
      return listToTaskList(node)
    }),
  )

  return updatedNodes
}

export function migrateDoc(node: RemirrorJSON): RemirrorJSON {
  if (node.type !== 'doc') {
    throw new Error('node must be a doc')
  }

  return migrateNodes([node])[0]
}
