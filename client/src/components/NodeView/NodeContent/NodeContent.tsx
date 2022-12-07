import React from 'react'
import { useRecoilValue } from 'recoil'
import { currentNodeState } from '../../../global/Atoms'
import { IFolderNode, INode } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import { MapContent } from './MapContent'
import { MapSidebar } from './MapSidebar'
import './NodeContent.scss'
import { TextContent } from './TextContent'
import { CommentContent } from './CommentContent'
import { IPin } from '../../../types'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  onCreateNodeButtonClick: () => void
  selectedPin: IPin | null
  setSelectedPin: (node: IPin) => void
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { onCreateNodeButtonClick, childNodes, selectedPin, setSelectedPin } = props
  const currentNode = useRecoilValue(currentNodeState)
  switch (currentNode.type) {
    case 'image':
      return <ImageContent />
    case 'text':
      return <TextContent />
    case 'map':
      return (
        <div className="map-content-wrapper">
          <div className="map-content-container">
            <MapContent selectedPin={selectedPin} setSelectedPin={setSelectedPin} />
          </div>
          <div className="comment-content-container">
            <CommentContent />
          </div>
        </div>
      )
    case 'folder':
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            childNodes={childNodes}
          />
        )
      }
  }
  return null
}
