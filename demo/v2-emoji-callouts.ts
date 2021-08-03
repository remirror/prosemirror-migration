import type { ProsemirrorNode } from "@remirror/core-types";
import type { MigrationDefinition } from "../src";

const emojiMap: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '⛔️',
  success: '✅'
}

const toEmojiCallouts: MigrationDefinition = {
  callout: ({ attrs = {}, content, ...rest }, migrate) => {
    const { type, emoji, ...restAttrs } = attrs
    if (emoji) {
      return {
        attrs,
        content: migrate(content),
        ...rest
      }
    }

    switch (type) {
      case 'info':
      case 'warning':
      case 'error':
      case 'success':
        return {
          attrs: {
            type,
            ...restAttrs,
            emoji: emojiMap[type]
          },
          content: migrate(content),
          ...rest
        }
      default: {
        return {
          attrs: {
            type,
            ...restAttrs,
            emoji: '😀'
          },
          content: migrate(content),
          ...rest
        }
      }
    }
  }
}

export default toEmojiCallouts;
