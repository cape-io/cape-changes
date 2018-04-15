/* globals describe test expect */
import {
  checkFeed, createResult, getDeleted, getId, getItemsIds, getTouchedIds,
  indexItemsById, itemCreated, itemUnchanged,
} from './'

const saved = {
  revision: '25f20',
  items: [
    { id: 'foo', revision: 'abc' },
    { id: 'bar', revision: 'def' },
    { id: 'baz', revision: 'ghi' },
  ],
}
const noSaved = {}
const savedItems = {
  foo: { id: 'foo', revision: 'abc' },
  bar: { id: 'bar', revision: 'def' },
  baz: { id: 'baz', revision: 'ghi' },
}
const fresh = {
  revision: 'xaybzd',
  items: [
    { id: 'foo', revision: 'abc' },
    { id: 'bar', revision: 'deg' },
    { id: 'zoom', revision: 'ab3' },
  ],
}
const freshItems = {
  foo: { id: 'foo', revision: 'abc' },
  bar: { id: 'bar', revision: 'deg' },
  zoom: { id: 'zoom', revision: 'ab3' },
}
const result = {
  saved: { ...saved, items: savedItems },
  fresh: { ...fresh, items: freshItems },
}
const resultDeleted = ['baz']
const resulted = {
  ...result, hasChanges: true, deleted: resultDeleted, created: ['zoom'], updated: ['bar'],
}
const result2 = { saved: result.saved, fresh: result.saved }

describe('itemHasChanges', () => {
  test('Compares revision.', () => {
    expect(itemUnchanged(saved, fresh)).toBe(false)
    expect(itemUnchanged({ revision: 'a' }, { revision: 'a' })).toBe(true)
  })
})
describe('General Utils', () => {
  test('indexItemsById', () => {
    expect(indexItemsById(saved)).toEqual({
      revision: '25f20',
      items: savedItems,
    })
  })
  test('createResult', () => {
    expect(createResult(saved, fresh)).toEqual(result)
    // expect(createResult(fresh, saved)).toEqual({ fresh: saved, saved: fresh })
  })
  test('getId', () => {
    expect(getId(freshItems.foo)).toBe('foo')
  })
  test('getItemsIds', () => {
    expect(getItemsIds(fresh)).toEqual(['foo', 'bar', 'zoom'])
  })
  test('getDeleted', () => {
    expect(getDeleted(result)).toEqual(resultDeleted)
    expect(getDeleted(result2)).toEqual([])
  })
  test('itemCreated', () => {
    expect(itemCreated(savedItems)(undefined, freshItems.foo)).toBe(false)
    expect(itemCreated(savedItems)(undefined, freshItems.zoom)).toBe(true)
  })
  test('getTouchedIds', () => {
    expect(getTouchedIds(resulted)).toEqual([
      { action: 'created', id: 'zoom' },
      { action: 'updated', id: 'bar' },
      { action: 'deleted', id: 'baz' },
    ])
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
})
