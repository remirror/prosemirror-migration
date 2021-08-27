import "jest"
import "jest-json"
import { migrate } from "./demo";

const TEST_HEADING = {
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text: 'Hello world'}],
}

describe('v0 => v2', () => {
  const newJSON = {
    type: 'doc',
    attrs: {version: 2},
    content: [
      {
        type: 'heading',
        attrs: {level: 1},
        content: [{type: 'text', text: 'Hello world'}],
      },
      {
        type: 'callout',
        attrs: {type: 'info', emoji: 'ℹ️'},
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskListItem',
                attrs: {checked: true},
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {type: 'text', text: 'a checked list item in a callout'},
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {type: 'paragraph'},
    ],
  }

  test('callout containing checkbox', () => {
    const oldJSON = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: {type: 'info'},
          content: [
            {
              type: 'orderedList',
              attrs: {order: 1},
              content: [
                {
                  type: 'listItem',
                  attrs: {closed: false, nested: false, hasCheckbox: true, checked: true},
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {type: 'text', text: 'a checked list item in a callout'},
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {type: 'paragraph'},
      ],
    }

    const result = migrate(oldJSON, 2)
    expect(JSON.stringify(result)).toMatchJSON(newJSON)
  })

  test('callout containing migrated checkbox', () => {
    const oldJSON = {
      type: 'doc',
      attrs: {version: 1},
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: {type: 'info'},
          content: [
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskListItem',
                  attrs: {checked: true},
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {type: 'text', text: 'a checked list item in a callout'},
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {type: 'paragraph'},
      ],
    }

    const result = migrate(oldJSON, 2)
    expect(JSON.stringify(result)).toMatchJSON(newJSON)
  })

  test('callout containing migrated checkbox (string version)', () => {
    const oldJSON = {
      type: 'doc',
      attrs: {version: "1"},
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: {type: 'info'},
          content: [
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskListItem',
                  attrs: {checked: true},
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {type: 'text', text: 'a checked list item in a callout'},
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {type: 'paragraph'},
      ],
    }

    const result = migrate(oldJSON, 2)
    expect(JSON.stringify(result)).toMatchJSON(newJSON)
  })
})

describe('v2 migrate', () => {
  it('should migrate callouts with no emoji to the default', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: { type: 'info' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Information'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'warning' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Warning'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'error' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Error'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'success' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Success'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'blank' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Blank'}]}],
        },
      ],
    }

    const result = migrate(input, 2)
    expect(JSON.stringify(result)).toMatchJSON({
      type: 'doc',
      attrs: {
        version: 2,
      },
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: { type: 'info', emoji: 'ℹ️' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Information'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'warning', emoji: '⚠️' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Warning'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'error', emoji: '⛔️' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Error'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'success', emoji: '✅' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Success'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'blank', emoji: '😀' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Blank'}]}],
        },
      ],
    })
  })

  it('should ignore callouts that already have emojis', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'callout',
          attrs: { type: 'info', emoji: '👍' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Information'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'warning', emoji: '👎' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Warning'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'error', emoji: '🤦‍️' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Error'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'success', emoji: '❤️' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Success'}]}],
        },
        {
          type: 'callout',
          attrs: { type: 'blank', emoji: '👌' },
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Blank'}]}],
        },
      ],
    }

    const result = migrate(input, 2)
    expect(JSON.stringify(result)).toMatchJSON(input)
  })
})
