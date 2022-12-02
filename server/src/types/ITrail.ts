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
    // typeof (object as ITrail).anchorList !== 'undefined'
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

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function isSameTrail(a1: ITrail, a2: ITrail): boolean {
  return (
    a1.trailId === a2.trailId && 
    arraysEqual(a1.anchorList, a2.anchorList) && 
    a1.nodeId === a2.nodeId
    // TODO: && check if the lists are the same?
    // But what if you want two trails that go to the same exact places
    // possibly in the same order BUT you want to show multiple people
    // going to the same place? -\(*-*)/-  <--shrug
  )
}
