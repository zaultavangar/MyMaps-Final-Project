import { IPin } from './IPin'

export interface ITrail {
  // add title and explainer
  trailId: string
  pinList: IPin[]
  nodeId: string
  title: string
  explainer: string
}

export type TrailFields = keyof ITrail

export function isITrail(object: any): object is ITrail {
  const propsDefined: boolean =
    typeof (object as ITrail).trailId !== 'undefined' &&
    typeof (object as ITrail).pinList !== 'undefined' &&
    typeof (object as ITrail).nodeId !== 'undefined' &&
    typeof (object as ITrail).title !== 'undefined' &&
    typeof (object as ITrail).explainer !== 'undefined'

  if (!propsDefined) {
    return false
  }

  return (
    typeof (object as ITrail).trailId === 'string' &&
    typeof (object as ITrail).nodeId === 'string' &&
    typeof (object as ITrail).title === 'string' &&
    typeof (object as ITrail).explainer === 'string'

    // typeof (object as ITrail).anchorList === []
    //    <-- TODO: Not sure how to do this / if it is needed
  )
}

export function makeITrail(
  trailId: string,
  pinList: IPin[],
  nodeId: string,
  title: string,
  explainer: string
): ITrail {
  return {
    trailId: trailId,
    pinList: pinList,
    nodeId: nodeId,
    title: title,
    explainer: explainer,
  }
}

export function isSameTrail(a1: ITrail, a2: ITrail): boolean {
  return (
    a1.trailId === a2.trailId &&
    a1.nodeId === a2.nodeId &&
    a1.title === a2.title &&
    a1.explainer === a2.explainer
    // TODO: && check if the lists are the same?
    // But what if you want two trails that go to the same exact places
    // possibly in the same order BUT you want to show multiple people
    // going to the same place? -\(*-*)/-  <--shrug
  )
}
