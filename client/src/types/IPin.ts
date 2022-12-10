import { INode } from './INode'
import { ITrail } from './ITrail'
/**
 *  Pin...
 */
export interface IPin {
  pinId: string
  nodeId: string
  trails: ITrail[]
  childNodes: INode[]
  title: string
  explainer: string
  topJustify?: number
  leftJustify?: number
}

export interface IGoogleMapPin {
  lat: number,
  lng: number,
}

export type PinFields = keyof IPin | keyof IGoogleMapPin

export function isIPin(object: any): object is IPin {
  const propsDefined: boolean =
    typeof (object as IPin).pinId !== 'undefined' &&
    typeof (object as IPin).nodeId !== 'undefined' &&
    typeof (object as IPin).trails !== 'undefined' &&
    typeof (object as IPin).childNodes !== 'undefined' &&
    typeof (object as IPin).title !== 'undefined' &&
    typeof (object as IPin).explainer !== 'undefined'

  if (!propsDefined) {
    return false
  }
  // check if all fields have the right type
  // and verify if filePath.path is properly defined
  return (
    typeof (object as IPin).pinId === 'string' &&
    typeof (object as IPin).nodeId === 'string' &&
    typeof (object as IPin).title === 'string' &&
    typeof (object as IPin).explainer === 'string' 
  )
}

export function makeIPin(
  pinId: string,
  nodeId: string,
  trailIds: { [trailId: string]: number },
  childNodes: string[],
  title: string,
  explainer: string,
  topJustify: number,
  leftJustify: number
) {
  return {
    pinId: pinId,
    nodeId: nodeId,
    trailIds: trailIds,
    childNodes: childNodes,
    title: title,
    explainer: explainer,
    topJustify: topJustify,
    leftJustify: leftJustify,
  }
}

export function makeIGoogleMapPin(
  pinId: string,
  nodeId: string,
  trailIds: { [trailId: string]: number },
  childNodes: string[],
  title: string,
  explainer: string,
  lat: number,
  lng: number,
) {
  return {
    pinId: pinId,
    nodeId: nodeId,
    trailIds: trailIds,
    childNodes: childNodes,
    title: title,
    explainer: explainer,
    lat: lat,
    lng: lng,
  }
}

/**
 * Get a snippet of the content described by an anchor's extent.
 * Return null if there's no user-friendly way to describe an anchor's extent,
 * e.g. for the rectangular selection on an image node.
 */

export function isSamePin(a1: IPin | null, a2: IPin | null): boolean {
  if (!a1 || !a2) {
    return false
  }
  return (
    a1.pinId === a2.pinId &&
    a1.nodeId === a2.nodeId &&
    a1.title === a2.title &&
    a1.explainer === a2.explainer 
  )
}
