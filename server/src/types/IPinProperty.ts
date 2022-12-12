import { PinFields, allPinFields } from '.'

export interface IPinProperty {
  fieldName: PinFields
  value: any
}

export function makeIPinProperty(fieldName: PinFields, newValue: any): IPinProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}

export function isIPinProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as IPinProperty).fieldName !== 'undefined' &&
    typeof (object as IPinProperty).value !== 'undefined'
  if (propsDefined && allPinFields.includes((object as IPinProperty).fieldName)) {
    switch ((object as IPinProperty).fieldName) {
      case 'pinId':
        return typeof (object as IPinProperty).value === 'string'
      case 'title':
        return typeof (object as IPinProperty).value === 'string'
      case 'nodeId':
        return typeof (object as IPinProperty).value === 'string'
      case 'trails':
        return Array.isArray((object as IPinProperty).value)
      case 'childNodes':
        return Array.isArray((object as IPinProperty).value)
      case 'explainer':
        return typeof (object as IPinProperty).value === 'string'
      case 'topJustify':
        return typeof (object as IPinProperty).value === 'number'
      case 'leftJustify':
        return typeof (object as IPinProperty).value === 'number'
      case 'lat':
        return typeof (object as IPinProperty).value === 'number'
      case 'lng':
        return typeof (object as IPinProperty).value === 'number'
      default:
        return true
    }
  }
}
