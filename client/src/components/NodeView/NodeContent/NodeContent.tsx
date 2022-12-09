import React, { useState } from 'react'
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
import { Select } from '@chakra-ui/react'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  onCreateNodeButtonClick: () => void
  selectedPin: IPin | null
  setSelectedPin: (node: IPin) => void
}

const viewModes = [
  'streets-v12',
  'outdoors-v12',
  'dark-v11',
  'satellite-v9',
  'satellite-streets-v12',
  'navigation-day-v12',
]

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { onCreateNodeButtonClick, childNodes, selectedPin, setSelectedPin } = props
  const currentNode = useRecoilValue(currentNodeState)

  const [selectedMapViewMode, setSelectedMapViewMode] = useState<string>('streets-v12')

  const handleSelectedMapViewMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value)
    setSelectedMapViewMode(event.target.value)
  }

  switch (currentNode.type) {
    case 'image':
      return <ImageContent />
    case 'text':
      return <TextContent />
    case 'map':
      return (
        <div className="map-content-wrapper">
          <div className="map-content-container">
            <MapContent
              selectedMapViewMode={selectedMapViewMode}
              selectedPin={selectedPin}
              setSelectedPin={setSelectedPin}
            />
          </div>
          <div className="comment-content-container">
            <CommentContent />
          </div>
        </div>
      )
    case 'googleMap':
      return (
        <>
          <div style={{ marginLeft: '10px', marginTop: '10px', width: 'fit-content' }}>
            <Select
              value={selectedMapViewMode}
              onChange={handleSelectedMapViewMode}
              placeholder="View Mode"
            >
              {viewModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() +
                    (mode === 'satellite-v9' ? mode.slice(1, -3) : mode.slice(1, -4))}
                </option>
              ))}
            </Select>
          </div>
          <div className="map-content-container">
            <MapContent
              selectedMapViewMode={selectedMapViewMode}
              selectedPin={selectedPin}
              setSelectedPin={setSelectedPin}
            />
          </div>
          <div className="comment-content-container">
            <CommentContent />
          </div>
        </>
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
