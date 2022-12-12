import React from 'react'
import {
  RiFolderLine,
  RiImageLine,
  RiStickyNoteLine,
  RiVideoLine,
  RiFilePdfLine,
  RiQuestionLine,
  RiMap2Line,
} from 'react-icons/ri'
import { SiMapbox } from 'react-icons/si'
import uniqid from 'uniqid'
import { NodeType } from '../types'
import { INodePath } from '../types'

export const nodeTypeIcon = (type: NodeType): JSX.Element => {
  switch (type) {
    case 'text':
      return <RiStickyNoteLine />
    case 'video':
      return <RiVideoLine />
    case 'folder':
      return <RiFolderLine />
    case 'image':
      return <RiImageLine />
    case 'pdf':
      return <RiFilePdfLine />
    case 'map':
      return <RiMap2Line />
    case 'googleMap':
      return <SiMapbox />
    default:
      return <RiQuestionLine />
  }
}

export const pathToString = (filePath: INodePath): string => {
  let urlPath: string = ''
  if (filePath.path) {
    for (const id of filePath.path) {
      urlPath = urlPath + id + '/'
    }
  }
  return urlPath
}

/**
 * Helpful for filtering out null and undefined values
 * @example
 * const validNodes = myNodes.filter(isNotNullOrUndefined)
 */
export const isNotNullOrUndefined = (data: any) => {
  return data != null
}

type hypertextObjectType = NodeType | 'link' | 'anchor' | 'pin' | 'trail'

export function generateObjectId(prefix: hypertextObjectType) {
  return uniqid(prefix + '.')
}
