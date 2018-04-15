Simple item list diff.

Say you have a `saved` list of items and you fetch a `fresh` list of items. Use this library to compare and get lists of `created`, `updated`, `deleted` items.

## API

### createFeedInfo(items)
`{ items, revision: 'aw3bc123' }`
* Adds revision property on every item.
* Calculates revision of all items.


### checkFeed(saved, fresh)
`saved` needs to have items in the form of an object keyed by id.

### getTouchedIds(checkFeedResult)

### checkFeedGetTouched(saved, fresh)
Same as `checkFeed` but includes touchedIds field.
