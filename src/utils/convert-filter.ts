import escape from 'escape-regexp'
import mongoose from 'mongoose'

/**
 * Changes AdminJS's {@link Filter} to an object acceptible by a mongoose query.
 *
 * @param {Filter} filter
 * @private
 */
export const convertFilter = (filter) => {
  if (!filter) {
    return {}
  }
  return filter.reduce((memo, filterProperty) => {
    const { path, property, value } = filterProperty
    const pathArray = path.split('.')
    const key = pathArray[0]
    let _value:any = value
    if (pathArray.length === 2) {
      _value = {
        [pathArray[1]]: value,
      }
    }
    let _property:any = property
    if (!_property) {
      _property = {
        type() {},
      }
    }
    switch (_property.type()) {
    case 'string':
      return {
        [key]: _value,
        ...memo,
      }
    case 'date':
    case 'datetime':
      if (_value.from || _value.to) {
        return {
          [key]: {
            ..._value.from && { $gte: _value.from },
            ..._value.to && { $lte: _value.to },
          },
          ...memo,
        }
      }
      break
    case 'id':
      if (mongoose.Types.ObjectId.isValid(_value)) {
        return {
          [key]: _value,
          ...memo,
        }
      }
      return {}
    default:
      break
    }
    return {
      [key]: _value,
      ...memo,
    }
  }, {})
}
