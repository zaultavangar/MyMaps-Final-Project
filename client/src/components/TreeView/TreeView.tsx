import React from 'react'
import { INode, IPin } from '../../types'
import { RecursiveNodeTree } from '../../types/RecursiveNodeTree'
import { TreeViewItem } from './TreeViewItem'
import './TreeView.scss'

export interface ITreeViewProps {
  changeUrlOnClick?: boolean
  roots: RecursiveNodeTree[]
  parentNode: INode | null
  setParentNode: (node: INode) => void
  selectedPin: IPin | null
  pins?: IPin[]
}

export const TreeView = (props: ITreeViewProps) => {
  const {
    roots,
    parentNode,
    setParentNode,
    changeUrlOnClick = true,
    selectedPin,
    pins,
  } = props
  return (
    <div className="treeView-wrapper">
      {roots.map((tree: RecursiveNodeTree) => (
        <div key={tree.node.nodeId}>
          {(tree.node.type === 'map' || tree.node.type === 'googleMap') && (
            <TreeViewItem
              node={tree.node}
              selectedPin={selectedPin}
              parentNode={parentNode}
              setParentNode={setParentNode}
              key={tree.node.nodeId}
              type={tree.node.type}
              title={tree.node.title}
              childNodes={tree.children}
              changeUrlOnClick={changeUrlOnClick}
              relevantPins={pins!.filter((pin) => pin.nodeId === tree.node.nodeId)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
