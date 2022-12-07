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
}

export const TreeView = (props: ITreeViewProps) => {
  const { roots, parentNode, setParentNode, changeUrlOnClick = true, selectedPin } = props
  return (
    <div className="treeView-wrapper">
      {roots.map((tree: RecursiveNodeTree) => (
        <div key={tree.node.nodeId}>
          {tree.node.type === 'map' && (
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
            />
          )}
        </div>
      ))}
    </div>
  )
}
