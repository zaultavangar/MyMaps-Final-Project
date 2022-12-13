import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { currentNodeState } from '../../../global/Atoms'
import { IFolderNode, INode, ITrail } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import { MapContent } from './MapContent'
import './NodeContent.scss'
import { TextContent } from './TextContent'
import { CommentContent } from './CommentContent'
import { Select, OrderedList, ListItem } from '@chakra-ui/react'

import { NavigationWindow } from './NavigationWindow'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  onCreateNodeButtonClick: () => void
  onCreateMapButtonClick: () => void
  isNavigating: boolean
  trailToNavigate: ITrail | null
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
  const {
    onCreateNodeButtonClick,
    onCreateMapButtonClick,
    childNodes,
    isNavigating,
    trailToNavigate,
  } = props
  const currentNode = useRecoilValue(currentNodeState)
  // const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  const [selectedMapViewMode, setSelectedMapViewMode] = useState<string>('streets-v12')

  const handleSelectedMapViewMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // console.log(event.target.value)
    setSelectedMapViewMode(event.target.value)
  }

  // fix positioing of navigation window

  switch (currentNode.type) {
    case 'image':
      return <ImageContent />
    case 'text':
      return <TextContent />
    case 'map':
      return (
        <>
          {isNavigating && trailToNavigate && (
            <NavigationWindow
              trailToNavigate={trailToNavigate}
              isNavigating={isNavigating}
            />
          )}
          <div className="map-content-container">
            <MapContent selectedMapViewMode={selectedMapViewMode} />
          </div>
          {!isNavigating && (
            <div className="comment-content-container">
              <CommentContent />
            </div>
          )}
        </>
      )
    case 'googleMap':
      return (
        <>
          {isNavigating && trailToNavigate && (
            <div className="" key={trailToNavigate.trailId}>
              <div className="-header">
                <h3>Route: {trailToNavigate.title}</h3>
                <div>{trailToNavigate.explainer}</div>
              </div>
              <div className="-subheader">
                <h5>Pins</h5>
              </div>
              <hr></hr>
              <OrderedList>
                <div className="-pins">
                  {trailToNavigate.pinList.map((pin, index) => (
                    <ListItem key={pin.title}>{pin.title}</ListItem>
                  ))}
                </div>
              </OrderedList>
            </div>
          )}

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
            <MapContent selectedMapViewMode={selectedMapViewMode} />
          </div>
          {!isNavigating && (
            <div className="comment-content-container">
              <CommentContent />
            </div>
          )}
        </>
      )
    case 'dashboard':
      return (
        <FolderContent
          node={currentNode as IFolderNode}
          onCreateNodeButtonClick={onCreateMapButtonClick}
          childNodes={childNodes || []}
        />
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
