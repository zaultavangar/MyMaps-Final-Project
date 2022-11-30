import { Handle, Position } from 'react-flow-renderer'
import './NodeInfo.scss'
import React from 'react'
import { nodeTypeIcon } from '../../../../global'

/**
 * The content of the nodes in the graph view. The content of each node in the
 * graph consists of the node's title and type (as well as an the icon associated)
 * with that type.
 */

const NodeInfo = ({ data }: any) => {
  const label = data.label // node label
  const type = data.flowNodeType // node type
  const icon = nodeTypeIcon(type) // type icon
  const currentNode = data.currentNode // current node (used for color on the nodes)

  return (
    <div
      className={`node-info-container ${
        currentNode.title == label ? 'current-node' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <h2>
        <b>{label}</b>
      </h2>
      <div className="node-info-type">
        <div className="node-info-icon">{icon}</div>
        <div className="node-info-string">
          <p>{type} node</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  )
}

export default NodeInfo
