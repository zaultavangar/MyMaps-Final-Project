import { TrailFields, allTrailFields } from '.'

export interface ITrailProperty {
  fieldName: TrailFields
  value: any
}

export function makeITrailProperty(fieldName: TrailFields, newValue: any): ITrailProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}

export function isITrailProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as ITrailProperty).fieldName !== 'undefined' &&
    typeof (object as ITrailProperty).value !== 'undefined'
  if (propsDefined && allTrailFields.includes((object as ITrailProperty).fieldName)) {
    switch ((object as ITrailProperty).fieldName) {
      case 'trailId':
        return typeof (object as ITrailProperty).value === 'string'
      case 'title':
        return typeof (object as ITrailProperty).value === 'string'
      case 'nodeId':
        return typeof (object as ITrailProperty).value === 'string'
      case 'pinList':
        return Array.isArray((object as ITrailProperty).value)
      case 'explainer':
        return typeof (object as ITrailProperty).value === 'string'
      default:
        return true
    }
  }
}