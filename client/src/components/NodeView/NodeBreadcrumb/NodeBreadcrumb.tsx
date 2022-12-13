import React from 'react'
import './NodeBreadcrumb.scss'
import {
  RiArrowRightSLine,
  RiFolderLine,
  RiImageLine,
  RiMap2Line,
  RiMapPinLine,
  RiStickyNoteLine,
} from 'react-icons/ri'
import { isNotNullOrUndefined, pathToString } from '../../../global'
import { NodeIdsToNodesMap, INode } from '../../../types'
import { useSetRecoilState } from 'recoil'
import { selectedNodeState } from '../../../global/Atoms'
import { Link } from 'react-router-dom'
import { IPin } from '../../../types'
import { Spinner } from '@chakra-ui/react'

export interface INodeBreadcrumbProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap
  path: string[]
  pinIdsToPinsMap: Record<string, IPin>
}

/** Render a breadcrumb that shows the path from the root to the current node */
export const NodeBreadcrumb = ({
  path,
  nodeIdsToNodesMap,
  pinIdsToPinsMap,
}: INodeBreadcrumbProps) => {
  const pathNodes = path
    .map((nodeId: string) => nodeIdsToNodesMap[nodeId])
    .filter(isNotNullOrUndefined)
  if (pathNodes.length === 0) return null
  const parentNodes = pathNodes.slice(0, -1)
  const currentNode = pathNodes[pathNodes.length - 1]
  const setSelectedNode = useSetRecoilState(selectedNodeState)

  // get this node's pin
  const pin = pinIdsToPinsMap[currentNode.pinId]

  // get the node of type map in the pathNodes, if it exists
  const mapNode = pathNodes.find((node) => node.type === 'map')

  return (
    <div className="node-breadcrumb">
      {parentNodes.map((node: INode) => (
        <Link
          to={`/${pathToString(node.filePath)}`}
          key={node.nodeId}
          style={{ display: 'flex' }}
        >
          <div className="breadcrumb-item-wrapper">
            <div className={'breadcrumb-item'} onClick={() => setSelectedNode(node)}>
              <div className="item-icon">
                {node.type === 'map' && <RiMap2Line />}
                {node.type === 'text' && <RiStickyNoteLine />}
                {node.type === 'image' && <RiImageLine />}
                {node.type === 'folder' && <RiFolderLine />}
              </div>
              {node.title}
            </div>
            <RiArrowRightSLine />
          </div>
          <div>
            {node.type === 'map' && pin && pin.nodeId == node.nodeId && (
              <div className="breadcrumb-item-wrapper">
                <div
                  className={'breadcrumb-item'}
                  onClick={() => setSelectedNode(mapNode || node)}
                >
                  <div className="item-icon">
                    <RiMapPinLine />
                  </div>
                  {pin?.title || <Spinner size="xs" />}
                </div>
                <RiArrowRightSLine />
              </div>
            )}
          </div>
        </Link>
      ))}
      <div key={currentNode.nodeId} className={'breadcrumb-item selected'}>
        <div className="item-icon">
          {currentNode.type === 'text' && <RiStickyNoteLine />}
          {currentNode.type === 'image' && <RiImageLine />}
          {currentNode.type === 'folder' && <RiFolderLine />}
          {currentNode.type === 'map' && <RiMap2Line />}
        </div>
        {currentNode.title}
      </div>
    </div>
  )
}
