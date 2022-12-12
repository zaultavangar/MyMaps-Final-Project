import { atom } from 'recoil'
import { INode, IAnchor, Extent, IPin, ITrail, makeIFolderNode } from '../../types'

// the selected node
export const selectedNodeState = atom<INode | null>({
  key: 'selectedNodeState',
  default: null,
})

export const trailToNavigateState = atom<ITrail | null>({
  key: 'trailToNavigateState',
  default: null,
})

// the current node, same as selected node unless selected node is null
export const currentNodeState = atom<INode>({
  key: 'currentNodeState',
  default: makeIFolderNode('root', [], [], 'folder', 'dashboard', '', 'grid'),
})

// whether a link is in progress
export const isLinkingState = atom<boolean>({
  key: 'isLinkingState',
  default: false,
})

export const isNavigatingState = atom<boolean>({
  key: 'isNavigatingState',
  default: false,
})

export const routeDrawerOpenState = atom<boolean>({
  key: 'routeDrawerOpenState',
  default: false,
})

export const tabIndexState = atom<number>({
  key: 'tabIndexState',
  default: 0,
})

export const specificTrailState = atom<ITrail | null>({
  key: 'specificTrailState',
  default: null,
})

// signal to refresh webpage
export const refreshState = atom<boolean>({
  key: 'refreshState',
  default: false,
})

// signal to refresh anchors
export const refreshAnchorState = atom<boolean>({
  key: 'refreshAnchorState',
  default: false,
})

// signal to refresh anchors
export const refreshLinkListState = atom<boolean>({
  key: 'refreshLinkListState',
  default: false,
})

export const mapPinsState = atom<IPin[]>({
  key: 'mapPinsState',
  default: [],
})

// start anchor for link
export const startAnchorState = atom<IAnchor | null>({
  key: 'startAnchorState',
  default: null,
})

// end anchor for link
export const endAnchorState = atom<IAnchor | null>({
  key: 'endAnchorState',
  default: null,
})

// selected anchor(s)
export const selectedAnchorsState = atom<IAnchor[]>({
  key: 'selectedAnchorsState',
  default: [],
})

// selected pin
export const selectedPinState = atom<IPin | null>({
  key: 'selectedPinState',
  default: null,
})

export const prevNavigationPinState = atom<IPin | null>({
  key: 'prevNavigationPinState',
  default: null,
})

export const currentNavigationPinState = atom<IPin | null>({
  key: 'currentNavigationPinState',
  default: null,
})

// selected extent
export const selectedExtentState = atom<Extent | null | undefined>({
  key: 'selectedExtentState',
  default: null,
})

export const confirmationOpenState = atom<boolean>({
  key: 'confirmationOpenState',
  default: false,
})

// whether alert is open
export const alertOpenState = atom<boolean>({
  key: 'alertOpenState',
  default: false,
})

// alert title
export const alertTitleState = atom<string>({
  key: 'alertTitleState',
  default: '',
})

// alert message
export const alertMessageState = atom<string>({
  key: 'alertMessageState',
  default: '',
})
