# prosemirror-migration

_prosemirror-migration_ is a tool for migrating [ProseMirror][prosemirror] documents when you have breaking changes to your [document schema](https://prosemirror.net/docs/ref/#model.Document_Schema).

It takes a **JSON encoded** ProseMirror document, and recursively descends through each node, executing a migration strategy for a node type.

This means migrations are completely customizable for your own use case, you simply need to define a migration _manifest_.

A manifest is an object, where the _keys_ are numeric schema versions, and the values are strategies that define how nodes need to be modified.

## Getting started

```bash
npm install prosemirror-migrate
```

Modify your ProseMirror schema to add support for a `version` attribute on your root node (usually the `doc` node).

```js
new Schema({
  nodes: {
    doc: {
      content: "block+",
      attrs: {
        version: { default: 1 }
      }
    },
    // omitted
  }
})
```

### Assumptions

* Documents are stored as JSON
* Knowledge of the structure of JSON encoded ProseMirror documents.

## Example

Take this contrived example, where we want to migrate our documents that contain **blockquotes**, and modify their `cite` attribute to our new domain name.

```js
import { createMigrate } from 'prosemirror-migrate';

const prosemirrorMigration = createMigrate({
  1: {
    blockquote: ({ attrs = {}, content, ...rest }, migrate) => {
      return {
        ...rest,
        attrs: {
          ...attrs,
          cite: attrs.cite.replace(
            'https://old.example.com',
            'https://new.example.com'
          )
        },
        content: migrate(content) // Recursively migrate child nodes
      }
    }
  }
});
```

This returns a function that we call to migrate our JSON.

```js
// Some generic DB query
const jsonStr = await someDb.get('some-guid', 'field');

// Migrate the content to version 1
const migrated = prosemirrorMigration(
  JSON.parse(jsonStr),
  1 // The target version
);

// Some generic DB write
await someDb.put('some-guid', 'field', JSON.stringify(migrated));
```

#### Result (as diff)

As well as the `cite` attribute update, note the addition of a version attribute on the `doc` node. This will become important later

```diff
{
  "type": "doc",
+  "attrs": {
+   "version": 1
+ },
  "content": [
    {
      "type": "blockquote",
      "attrs": {
-       "cite": "https://old.example.com/page/1"
+       "cite": "https://new.example.com/page/1"
      },
      "content": [{
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Hello" }
        ]
      }]
    }
  ]
}
```

So far, we have only migrated `blockquote` nodes, but it's likely you want to migrate other nodes too.

### Migrating multiple node types

In the example below, we migrate _both_ `blockquote` and `text` nodes.

```js
const prosemirrorMigration = createMigrate({
  1: {
    blockquote: ({ attrs = {}, content, ...rest }, migrate) => {
      return {
        ...rest,
        attrs: {
          ...attrs,
          cite: attrs.cite.replace(
            'https://old.example.com',
            'https://new.example.com'
          )
        },
        content: migrate(content) // Recursively migrate child nodes
      }
    },
    text: ({ text, ...rest }) => {
      return {
        ...rest,
        text: text.replaceAll(
          'https://old.example.com',
          'https://new.example.com'
        ),
        // No need to recursively call migrate here
      }
    }
  }
});
```

### Multiple versions

As previously stated, a manifest allows us to define multiple schema versions.

To define a new version, we simply add a new key and value to the manifest record.

```js
const prosemirrorMigration = createMigrate({
  1: {
    blockquote: ({ attrs = {}, content, ...rest }, migrate) => {
      // omitted
    },
    text: ({ text, ...rest }) => {
      // omitted
    }
  },
  2: {
    bulletList: ({ attrs = {}, content, ...rest }, migrate) => {
      // omitted
    },
    orderedList: ({ attrs = {}, content, ...rest }, migrate) => {
      // omitted
    }
  }
});
```

N.B. we recommend defining each version strategy in it's own file for readability.

```js
import toNewDomain from './v1';
import toTasklists from './v2';

const prosemirrorMigration = createMigrate({
  1: toNewDomain,
  2: toTasklists
});
```

## Lazy migrations (optional)

By storing the schema version as an attribute on the `doc` node, we can keep a record of which migrations have already been run on a document.

This enables us to have _lazy_ migrations - i.e. only migrating documents when they are loaded, rather than updating every document in a database in one go.

This is useful if your database contains millions of records, or perhaps you need to pay your cloud provider per database write.

Using this strategy would mean over time, you have documents with a _range of different schema versions_ - some that haven't been accessed in a very long time still using version 1, others using version 2, and so on.

By using the `version` attribute on the `doc` node, in combination with your migration manifest _prosemirror-migration_ works out which migrations need to be executed.

For instance if your manifest defines 5 versions, _prosemirror-migration_ skips the migrations that have already been applied, and executes the remaining sequentially.

| Current doc version |   Migrations run  |
|:-------------------:|:-----------------:|
|          2          |     3, 4 and 5    |
|          4          |         5         |
|          5          | _&lt;nothing&gt;_ |

## Contributing

Please read our [contribution guide][contribution guide] for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[contribution guide]: https://remirror.io/docs/contributing
[prosemirror]: https://prosemirror.net
