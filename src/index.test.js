/* globals describe test expect */
import {
  addTouched, checkFeed, checkFeedGetTouched, createFeedInfo, createResult,
  getDeleted, getId, getItemsIds, getTouchedIds,
  indexItemsById, itemCreated, itemUnchanged,
} from './'

const items = [
  { id: 'foo', name: 'one' },
  { id: 'bar', name: 'two' },
  { id: 'baz', name: 'threes' },
]
const itemsRev = [
  { id: 'foo', name: 'one', revision: 'f3295639c2ce8d7fa8a36e18beb583fcdbf94e55' },
  { id: 'bar', name: 'two', revision: 'cc38d0d8dfa48b9a6a2b462a3ecaf63ace003944' },
  { id: 'baz', name: 'threes', revision: '5da6e9498d2c70909e51af299f2ad0fd161f21b0' },
]
const savedItems = {
  foo: { id: 'foo', name: 'one', revision: 'f3295639c2ce8d7fa8a36e18beb583fcdbf94e55' },
  bar: { id: 'bar', name: 'two', revision: 'cc38d0d8dfa48b9a6a2b462a3ecaf63ace003944' },
  baz: { id: 'baz', name: 'threes', revision: '5da6e9498d2c70909e51af299f2ad0fd161f21b0' },
}
const feedInfo = {
  revision: '7ec4491925a9a04a5f1233f25fb920ab1a12d5a1',
  items: itemsRev,
}
const saved = { ...feedInfo, items: savedItems }
const noSaved = {}

const itemsFresh = [
  { id: 'foo', name: 'one' },
  { id: 'bar', name: 'two bee' },
  { id: 'zoom', name: 'four' },
]
const fresh = {
  items: [
    { id: 'foo', name: 'one', revision: 'f3295639c2ce8d7fa8a36e18beb583fcdbf94e55' },
    { id: 'bar', name: 'two bee', revision: 'ccbded4537e839dfa9776a617e7c1f68db7ceea5' },
    { id: 'zoom', name: 'four', revision: '15b7c6fc6412033063f63d0101b25583cc5f1402' },
  ],
  revision: '35f177acadc54075a0d957725949c8987e4617ac',
}

const result = { saved, fresh }

const resultDeleted = ['baz']
const resulted = {
  ...result,
  hasChanges: true,
  deleted: resultDeleted,
  created: ['zoom'],
  updated: ['bar'],
}
const touchedIds = [
  { action: 'created', id: 'zoom' },
  { action: 'updated', id: 'bar' },
  { action: 'deleted', id: 'baz' },
]
const result2 = { saved: result.saved, fresh: result.saved }

describe('createFeedInfo', () => {
  const res = createFeedInfo(items)
  test('Creates revision property that is a hash of all items.', () => {
    expect(res.revision).toBe('7ec4491925a9a04a5f1233f25fb920ab1a12d5a1')
  })
  test('Creates revision property on every item.', () => {
    expect(res.items).toEqual(itemsRev)
  })
  test('complete result', () => {
    expect(res).toEqual(feedInfo)
    expect(createFeedInfo(itemsFresh)).toEqual(fresh)
  })
})

describe('itemHasChanges', () => {
  test('Compares revision.', () => {
    expect(itemUnchanged(saved, fresh)).toBe(false)
    expect(itemUnchanged({ revision: 'a' }, { revision: 'a' })).toBe(true)
  })
})
describe('General Utils', () => {
  test('indexItemsById', () => {
    expect(indexItemsById(saved)).toEqual({
      revision: '7ec4491925a9a04a5f1233f25fb920ab1a12d5a1',
      items: savedItems,
    })
  })
  test('createResult', () => {
    expect(createResult(saved, fresh)).toEqual(result)
    // expect(createResult(fresh, saved)).toEqual({ fresh: saved, saved: fresh })
  })
  test('getId', () => {
    expect(getId(savedItems.foo)).toBe('foo')
  })
  test('getItemsIds', () => {
    expect(getItemsIds(fresh)).toEqual(['foo', 'bar', 'zoom'])
  })
  test('getDeleted', () => {
    expect(getDeleted(result)).toEqual(resultDeleted)
    expect(getDeleted(result2)).toEqual([])
  })
  test('itemCreated', () => {
    expect(itemCreated(savedItems)(undefined, fresh.items[0])).toBe(false)
    expect(itemCreated(savedItems)(undefined, fresh.items[2])).toBe(true)
  })
  test('addTouched', () => {
    const res = addTouched('created')(resulted)
    expect(res).toEqual([{ action: 'created', id: 'zoom' }])
  })
  test('getTouchedIds', () => {
    expect(getTouchedIds(resulted)).toEqual(touchedIds)
  })
})
describe('checkFeed', () => {
  test('new, deleted, updated', () => {
    expect(checkFeed(saved, fresh)).toEqual(resulted)
  })
  test('Handle no items. checkFeed', () => {
    expect(checkFeed(noSaved, fresh))
      .toEqual({
        fresh: result.fresh,
        saved: noSaved,
        deleted: [],
        updated: [],
        created: ['foo', 'bar', 'zoom'],
        hasChanges: true,
      })
  })
  test('Revision match no changes.', () => {
    expect(checkFeed(saved, saved)).toEqual({ ...result2, hasChanges: false })
  })
  test('checkFeedGetTouched', () => {
    expect(checkFeedGetTouched(saved, fresh).touchedIds).toEqual(touchedIds)
  })
})
