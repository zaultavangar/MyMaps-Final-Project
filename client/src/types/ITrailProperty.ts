import { TrailFields } from '.'

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