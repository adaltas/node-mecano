---
navtitle: templated
---

# Metadata "templated"

Nikita provides templating in configuration properties using the [Handlebars](https://handlebarsjs.com/) templating engine. It traverses properties recursively and uses the same self-referenced object as a context. The `templated` metadata enables or disables templating. It is enabled by default.

* Type: `boolean`

All the properties from the current action are available including [`config`](/current/action/config/) and [`metadata`](/current/action/config/).

You can traverse relative actions with the [`parent`](/current/action/parent/), [`siblings`](/current/action/siblings/) and [`sibling`](/current/action/sibling/) properties as well. Those last three properties will no longer be available once an action has resolved.

Once it is resolved, in addition to the [`config`](/current/action/config/) and [`metadata`](/current/action/config/) properties, the action exposes the [`children`](/current/action/children/) property as well as one of the [`output`](/current/action/output/) or [`error`](/current/action/config/) properties depending on its outcome.

## Usage

You can access all the properties of the current action. Here is an example accessible the output of the previous sibling:

```js
nikita
.call({
  // highlight-next-line
  secret: 'my previous',
}, function({config}) {
  return `My secret is "${config.secret}"`
})
.call({
  // highlight-next-line
  secret: '{{{sibling.output}}}',
}, function({config}) {
  // highlight-next-line
  console.info(config.secret)
  // Print `My secret is "my previous"`
})
```

## Dynamic references

It is not required to refer directly to a property. A property may refer to another property which itself refers to another property. Properties do not need to be set in any particular order. Their value are dynamically resolved and an error is thrown in case of a circular reference.

```js
nikita({
  secret: 'my precious'
}, function(){
  this.call({
    // highlight-next-line
    my: 'My {{{config.secret}}}',
    // Note the usage of triple-stash to avoid escaping html entities
    // highlight-next-line
    is: 'is "{{{parent.config.secret}}}"',
    // highlight-next-line
    secret: 'secret {{{config.is}}}'
  }, function({config}) {
    console.info(config.my)
    // Print `My secret is "my previous"`
  })
})
```

## Accessing properties of resolved actions

The [`sibling`](/current/action/sibling/) property is no longer available once the action has resolved. The same goes for the [`parent`](/current/action/parent/) and [`siblings`](/current/action/siblings/) properties. This example uses the [`parent`](/current/action/parent/) and [`children`](/current/action/children/) properties:

```js
nikita
.call({
  // highlight-next-line
  secret: 'my previous',
}, function({config}) {
  return `My secret is "${config.secret}"`
})
.call(function({config}) {
  // Call a child action
  this.call({
    // Note the usage of triple-stash to avoid escaping html entities
    // highlight-next-line
    secret: '{{{parent.parent.children.[0].output}}}',
  }, function({config}) {
    console.info(config.secret)
    // Print `My secret is "my previous"`
  })
})
```

## Desactivation

Templating is enabled by default. To disable templating, set the `templated` metadata to the value `false`:

```js
nikita
// Call an action with templating (by default)
.call({
  // highlight-next-line
  $templated: false,
  key_1: 'value 1',
  // highlight-next-line
  key_2: 'value 2 and {{config.key_1}}'
}, function({config}) {
  console.info(config.key_2)
  // Print "value 2 and {{config.key_1}}"
})
```