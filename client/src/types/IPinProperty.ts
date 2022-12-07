import { PinFields } from '.'

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