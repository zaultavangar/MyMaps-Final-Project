export interface ITrail {
  trailId: string
  anchorList: string[]
  nodeId: string
}

export function isITrail(object: any): object is ITrail {
  const propsDefined: boolean =
    typeof (object as ITrail).trailId !== 'undefined' &&
    typeof (object as ITrail).anchorList !== 'undefined' &&
    typeof (object as ITrail).nodeId !== 'undefined'

  if (!propsDefined) {
    return false
  }
  return (
    typeof (object as ITrail).trailId === 'string' &&
    typeof (object as ITrail).nodeId === 'string'
    // typeof (object as ITrail).anchorList === [] 
    //    <-- TODO: Not sure how to do this / if it is needed
  )
}

export function makeITrail(trailId: string, anchorList: string[], nodeId: string): ITrail {
  return {
    trailId: trailId,
    anchorList: anchorList,
    nodeId: nodeId
  }
}

export function isSameTrail(a1: ITrail, a2: ITrail): boolean {
  return (
    a1.trailId === a2.trailId && 
    a1.anchorList === a2.anchorList && 
    a1.nodeId === a2.nodeId
    // TODO: && check if the lists are the same?
    // But what if you want two trails that go to the same exact places
    // possibly in the same order BUT you want to show multiple people
    // going to the same place? -\(*-*)/-  <--shrug
  )
}
