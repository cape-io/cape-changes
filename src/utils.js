import { curry } from 'lodash/fp'

export const buildCompare = (selector, transformer) => (arg1, arg2) =>
  // [selector(arg1), selector(arg2), transformer]
  transformer(selector(arg1), selector(arg2))

export const mergeFields = curry((transformer, item) =>
  ({ ...item, ...transformer(item) }))
