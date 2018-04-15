import {
  at, cond, difference, eq, flatten, flow, get,
  identity, keyBy, map, negate, over, reduce, set, spread, stubTrue,
} from 'lodash/fp'
import { condId, createObj, replaceField, setField, setWith } from 'cape-lodash'
import hash from 'object-hash'
import { buildCompare, mergeFields } from './utils'

export const REV = 'revision'
export const ITEMS = 'items'
export const ID = 'id'
export const CHANGES = 'hasChanges'

export const getItems = get(ITEMS)
export const getId = get(ID)
export const getItemsIds = flow(getItems, map(getId))
export const setRevision = setField(REV, hash)
export const getRev = get(REV)
export const buildIndex = keyBy(ID)
export const indexItemsById = replaceField('items', buildIndex)
export const withSavedFresh = transformer => flow(at(['saved', 'fresh']), spread(transformer))
export const createFeedInfo = flow(
  map(setRevision),
  createObj(ITEMS),
  setWith(REV, ITEMS, hash),
)

export const itemUnchanged = buildCompare(getRev, eq)
export const feedUnchanged = withSavedFresh(itemUnchanged)

// export const getDeleted = buildResultCompare(getItemsIds, flow(difference, ))
export const getDeleted = withSavedFresh(buildCompare(getItemsIds, difference))

export const isItemUnchanged = savedItems => (result, item) =>
  itemUnchanged(get(getId(item), savedItems), item)

export const itemCreated = savedItems => (result, item) =>
  !get(getId(item), savedItems)

export function addCreated(result, item) {
  result.created.push(getId(item))
  return result
}
export function addUpdated(result, item) {
  result.updated.push(getId(item))
  return result
}
export const newChangedReducer = savedItems => cond([
  [itemCreated(savedItems), addCreated],
  [isItemUnchanged(savedItems), identity],
  [stubTrue, addUpdated],
])

export const addCreatedUpdated = result =>
  reduce(newChangedReducer(result.saved.items), { created: [], updated: [] }, result.fresh.items)

export const compareItems = flow(
  setField('deleted', getDeleted),
  mergeFields(addCreatedUpdated),
)
export const createResult = buildCompare(indexItemsById, (saved, fresh) => ({ saved, fresh }))

export const checkFeed = flow(
  createResult,
  setField(CHANGES, negate(feedUnchanged)),
  condId([get(CHANGES), compareItems])
)

export const addTouched = actionId => flow(
  get(actionId),
  map(flow(createObj(ID), set('action', actionId)))
)

export const getTouchedIds = flow(
  over([addTouched('created'), addTouched('updated'), addTouched('deleted')]),
  flatten
)
