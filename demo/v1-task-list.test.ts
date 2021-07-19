import "jest"
import "jest-json"
import { migrate } from "./demo";

const TEST_HEADING = {
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text: 'Hello world'}],
}

describe('v0 => v1', () => {
  test('checkbox', () => {
    const oldJSON = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {type: 'paragraph', content: [{type: 'text', text: 'Just a paragraph'}]},
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {closed: false, nested: false, hasCheckbox: false, checked: false},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'a bullet list item'}],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: 'a paragraph with '},
            {type: 'text', marks: [{type: 'italic'}], text: 'some'},
            {type: 'text', text: ' '},
            {type: 'text', marks: [{type: 'bold'}], text: 'marks'},
            {type: 'text', text: ' and backlink '},
            {type: 'backlink', attrs: {id: 'alex', label: 'Alex'}},
            {type: 'text', text: ' and '},
            {type: 'tag', attrs: {id: '2021-06-30T16:37:24.896Z', label: 'tag'}},
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {closed: false, nested: false, hasCheckbox: true, checked: true},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'a checked list item'}],
                },
              ],
            },
            {
              type: 'listItem',
              attrs: {closed: false, nested: false, hasCheckbox: true, checked: false},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'an unchecked list item'}],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
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
                        {type: 'text', text: 'a checked list item in a quotablock'},
                      ],
                    },
                    {
                      type: 'orderedList',
                      attrs: {order: 1},
                      content: [
                        {
                          type: 'listItem',
                          attrs: {
                            closed: false,
                            nested: false,
                            hasCheckbox: true,
                            checked: true,
                          },
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {type: 'text', text: 'and a nested checked list item'},
                              ],
                            },
                            {
                              type: 'orderedList',
                              attrs: {order: 1},
                              content: [
                                {
                                  type: 'listItem',
                                  attrs: {
                                    closed: false,
                                    nested: false,
                                    hasCheckbox: true,
                                    checked: true,
                                  },
                                  content: [
                                    {
                                      type: 'paragraph',
                                      content: [
                                        {
                                          type: 'text',
                                          text: 'another nested checked list item',
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
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

    const newJSON = {
      type: 'doc',
      attrs: {version: 1},
      content: [
        {
          type: 'heading',
          attrs: {level: 1},
          content: [{type: 'text', text: 'Hello world'}],
        },
        {type: 'paragraph', content: [{type: 'text', text: 'Just a paragraph'}]},
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {closed: false, nested: false},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'a bullet list item'}],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: 'a paragraph with '},
            {type: 'text', marks: [{type: 'italic'}], text: 'some'},
            {type: 'text', text: ' '},
            {type: 'text', marks: [{type: 'bold'}], text: 'marks'},
            {type: 'text', text: ' and backlink '},
            {type: 'backlink', attrs: {id: 'alex', label: 'Alex'}},
            {type: 'text', text: ' and '},
            {type: 'tag', attrs: {id: '2021-06-30T16:37:24.896Z', label: 'tag'}},
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskListItem',
              attrs: {checked: true},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'a checked list item'}],
                },
              ],
            },
            {
              type: 'taskListItem',
              attrs: {checked: false},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'an unchecked list item'}],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
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
                        {type: 'text', text: 'a checked list item in a quotablock'},
                      ],
                    },
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
                                {type: 'text', text: 'and a nested checked list item'},
                              ],
                            },
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
                                        {
                                          type: 'text',
                                          text: 'another nested checked list item',
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
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

    const result = migrate(oldJSON, 1)
    expect(JSON.stringify(result)).toMatchJSON(newJSON)
  })
})

describe('migrate', () => {
  it('ignores regular bullet list', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'foo'}]}],
            },
            {
              type: 'listItem',
              attrs: {},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'bar'}]}],
            },
          ],
        },
      ],
    }

    const result = migrate(input, 1)
    expect(JSON.stringify(result)).toMatchJSON(input)
  })

  it('ignores regular ordered list', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'orderedList',
          attrs: {order: 1},
          content: [
            {
              type: 'listItem',
              attrs: {},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'foo'}]}],
            },
            {
              type: 'listItem',
              attrs: {},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'bar'}]}],
            },
          ],
        },
      ],
    }

    const result = migrate(input, 1)
    expect(JSON.stringify(result)).toMatchJSON(input)
  })

  it('breaks up mixed list into multiple lists', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {},
              content: [
                {type: 'paragraph', content: [{type: 'text', text: 'regular item'}]},
              ],
            },
            {
              type: 'listItem',
              attrs: {hasCheckbox: true, checked: true},
              content: [
                {type: 'paragraph', content: [{type: 'text', text: 'task item'}]},
              ],
            },
            {
              type: 'listItem',
              attrs: {hasCheckbox: true, checked: false},
              content: [
                {type: 'paragraph', content: [{type: 'text', text: 'another task item'}]},
              ],
            },
            {
              type: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'another regular item'}],
                },
              ],
            },
          ],
        },
      ],
    }

    const result = migrate(input, 1)
    const types = result.content?.map((node) => node.type)

    expect(types).toEqual(['heading', 'bulletList', 'taskList', 'bulletList'])
  })

  it('transforms nested list items with checkboxes to task lists', () => {
    const input = {
      type: 'doc',
      content: [
        TEST_HEADING,
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: { hasCheckbox: false, checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'foo'}]
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      attrs: { hasCheckbox: true, checked: true },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{type: 'text', text: 'checked'}]
                        }
                      ],
                    },
                    {
                      type: 'listItem',
                      attrs: { hasCheckbox: true, checked: false },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{type: 'text', text: 'unchecked'}]
                        }
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    const result = migrate(input, 1)
    expect(JSON.stringify(result)).toMatchJSON({
      type: 'doc',
      attrs: {
        version: 1,
      },
      content: [
        TEST_HEADING,
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'paragraph',
                  content: [{type: 'text', text: 'foo'}]
                },
                {
                  type: 'taskList',
                  content: [
                    {
                      type: 'taskListItem',
                      attrs: { checked: true },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{type: 'text', text: 'checked'}]
                        }
                      ],
                    },
                    {
                      type: 'taskListItem',
                      attrs: { checked: false },
                      content: [
                        {
                          type: 'paragraph',
                          content: [{type: 'text', text: 'unchecked'}]
                        }
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })
})
