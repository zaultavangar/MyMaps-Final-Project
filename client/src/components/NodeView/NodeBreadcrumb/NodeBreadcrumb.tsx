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

  // get the node of type map in the pathNodes, if it exists
  const mapNode = pathNodes.find((node) => node.type === 'map')

  return (
    <div className="node-breadcrumb">
      {parentNodes.map((node: INode) => (
        <Link to={`/${pathToString(node.filePath)}`} key={node.nodeId}>
          {/* {node.type !== 'map' && (
            <div className="breadcrumb-item-wrapper">
              <div
                className={'breadcrumb-item'}
                onClick={() => setSelectedNode(mapNode || node)}
              >
                {pinIdsToPinsMap[node.pinId]?.title || 'Pin'}
              </div>
              <RiArrowRightSLine />
            </div>
          )} */}
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
        </Link>
      ))}
      <div>
        {currentNode.type !== 'map' && (
          <Link
            to={`/${pathToString(mapNode?.filePath || currentNode.filePath)}`}
            key={currentNode.nodeId}
          >
            <div className="breadcrumb-item-wrapper">
              <div
                className={'breadcrumb-item'}
                onClick={() => setSelectedNode(mapNode || currentNode)}
              >
                <div className="item-icon">
                  <RiMapPinLine />
                </div>
                {pinIdsToPinsMap[currentNode.pinId]?.title || 'Pin'}
              </div>
              <RiArrowRightSLine />
            </div>
          </Link>
        )}
      </div>
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
