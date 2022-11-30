import React, { useMemo } from 'react'
import ReactFlow, {
  Controls,
  Edge,
  FitViewOptions,
  ReactFlowProvider,
} from 'react-flow-renderer'
import 'reactflow/dist/style.css'
import NodeInfo from './NodeInfo'
import { CustomNode } from '../../../NodeView'

export interface IFlowProps {
  nodes: CustomNode[]
  edges: Edge<any>[]
}

/**
 * Graph of the current node withthe nodes it has links to/from, with links
 * represented as edges between the nodes.
 */
function Flow(props: IFlowProps) {
  const { nodes, edges } = props

  // Establishes the NodeInfo component has the node type
  const nodeTypes = useMemo(() => ({ ni: NodeInfo }), [])

  const defaultEdgeOptions = { animated: true } // animated edges

  // options for the flow view
  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
  }

  return (
    <div style={{ height: 500 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
        />
        <Controls />
      </ReactFlowProvider>
    </div>
  )
}

export default Flow
