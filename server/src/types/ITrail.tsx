import { Extent, isExtent, isSameExtent } from './Extent'

/**
 *  An anchor to be used in links. Consists of a nodeId and the
 *  extent of the anchor in that node
 */
export interface ITrail {
  // anchorId: string
  // Defines the extent of the anchor in the document,
  // e.g. start / end characters in a text node.
  // If extent is null, the anchor points to the node as a whole.
  // extent: Extent | null
  trailId: string
  anchorList: string[]
}

export function isITrail(object: any): object is ITrail {
  const propsDefined: boolean =
    // typeof (object as ITrail).anchorId !== 'undefined' &&
    typeof (object as ITrail).trailId !== 'undefined' &&
    typeof (object as ITrail).anchorList !== 'undefined'
  // typeof (object as ITrail).extent !== 'undefined'
  if (!propsDefined) {
    return false
  }
  // check if all fields have the right type
  // and verify if filePath.path is properly defined
  return (
    // typeof (object as ITrail).anchorId === 'string' &&
    // typeof (object as ITrail).nodeId === 'string' &&
    // isExtent(object)
    typeof (object as ITrail).trailId === 'string'
    // typeof (object as ITrail).anchorList === [] <-- TODO: Not sure how to do this / if it is needed
  )
}

export function makeITrail(trailId: string, anchorList: string[]) {
  return {
    trailId: trailId,
    anchorList: anchorList,
  }
}

export function isSameTrail(a1: ITrail, a2: ITrail): boolean {
  return (
    a1.trailId === a2.trailId && a1.trailId === a2.trailId
    // TODO: && check if the lists are the same?
    // But what if you want two trails that go to the same exact places
    // possibly in the same order BUT you want to show multiple people
    // going to the same place? -\(*-*)/-  <--shrug
  )
}
