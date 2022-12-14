import React, { useState } from 'react'
import { RiArrowRightSLine, RiFolderOpenLine, RiMapPinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { nodeTypeIcon, pathToString } from '../../../global'
import { selectedPinState } from '../../../global/Atoms'
import { INode, NodeType, IPin } from '../../../types'
import { RecursiveNodeTree } from '../../../types/RecursiveNodeTree'
import './TreeViewItem.scss'

interface ITreeViewProps {
  changeUrlOnClick?: boolean
  childNodes: RecursiveNodeTree[]
  node: INode
  parentNode: INode | null
  setParentNode: (node: INode) => void
  title: string
  type: NodeType | 'pin'
  selectedPin: IPin | null
  pins?: IPin[] | null
}

export const TreeViewItem = ({
  node,
  type,
  title,
  childNodes,
  parentNode,
  setParentNode,
  changeUrlOnClick,
  selectedPin,
  pins,
}: ITreeViewProps) => {
  // get the relevant pins for this node
  const relevantPins = pins?.filter((pin) => pin.nodeId === node.nodeId)
  const [selectedMapPin, setSelectedMapPin] = useRecoilState(selectedPinState)

  let childrenItems: JSX.Element[] = []
  if (childNodes.length || (relevantPins && relevantPins.length)) {
    if (relevantPins && relevantPins.length) {
      // create a dictionary that maps the pin to the childnode(s)
      // that have said pin as their pinId
      const pinToChildNode: { [key: string]: RecursiveNodeTree[] } = {}
      childNodes.forEach((child: RecursiveNodeTree) => {
        if (child.node.pinId) {
          if (pinToChildNode[child.node.pinId]) {
            pinToChildNode[child.node.pinId].push(child)
          } else {
            pinToChildNode[child.node.pinId] = [child]
          }
        }
      })

      // define mapChildren as all of the childNodes that are not in relevantPins
      const mapChildren = childNodes.filter((child: RecursiveNodeTree) => {
        return !relevantPins.find((pin) => pin.pinId === child.node.pinId)
      })

      // For each pin in the relevantPins array, create a TreeViewItem
      // for the pin, and if it has any childnodes in the pinToChildNode
      // dictionary, add those as children to the pin TreeViewItem
      childrenItems = relevantPins.map((pin: IPin) => {
        const pinChildren = pinToChildNode[pin.pinId]
        return (
          <div onClick={() => setSelectedMapPin(pin)} key={pin.pinId}>
            <TreeViewItem
              node={node}
              parentNode={parentNode}
              setParentNode={setParentNode}
              key={pin.pinId}
              type={'pin'}
              title={pin.title}
              childNodes={pinChildren ? pinChildren : []}
              changeUrlOnClick={changeUrlOnClick}
              selectedPin={pin}
            />
          </div>
        )
      })
      // Add the mapChildren to the end of the childrenItems array
      childrenItems = childrenItems.concat(
        mapChildren.map((child: RecursiveNodeTree) => {
          return changeUrlOnClick ? (
            <Link to={`/${pathToString(child.node.filePath)}`} key={child.node.nodeId}>
              <TreeViewItem
                node={child.node}
                parentNode={parentNode}
                setParentNode={setParentNode}
                type={child.node.type}
                title={child.node.title}
                childNodes={child.children}
                changeUrlOnClick={changeUrlOnClick}
                selectedPin={selectedPin}
                pins={pins}
              />
            </Link>
          ) : (
            <TreeViewItem
              node={child.node}
              parentNode={parentNode}
              setParentNode={setParentNode}
              key={child.node.nodeId}
              type={child.node.type}
              title={child.node.title}
              childNodes={child.children}
              changeUrlOnClick={changeUrlOnClick}
              selectedPin={selectedPin}
              pins={pins}
            />
          )
        })
      )
    } else {
      childrenItems = childNodes.map((child: RecursiveNodeTree) => {
        return changeUrlOnClick ? (
          <Link to={`/${pathToString(child.node.filePath)}`} key={child.node.nodeId}>
            <TreeViewItem
              node={child.node}
              parentNode={parentNode}
              setParentNode={setParentNode}
              type={child.node.type}
              title={child.node.title}
              childNodes={child.children}
              changeUrlOnClick={changeUrlOnClick}
              selectedPin={selectedPin}
            />
          </Link>
        ) : (
          <TreeViewItem
            node={child.node}
            parentNode={parentNode}
            setParentNode={setParentNode}
            key={child.node.nodeId}
            type={child.node.type}
            title={child.node.title}
            childNodes={child.children}
            changeUrlOnClick={changeUrlOnClick}
            selectedPin={selectedPin}
          />
        )
      })
    }
  }

  const [isOpen, toggleOpen] = useState(false)
  const toggleFolder = () => {
    toggleOpen(!isOpen)
  }

  const TreeViewChild = () => {
    return (
      <div
        className={`item-wrapper ${isSelected}`}
        onClick={() => {
          setParentNode(node)
        }}
      >
        {hasChildren ? (
          <div className={`icon-hover ${hasChildren}`} onClick={toggleFolder}>
            <div
              className="icon-wrapper"
              style={{
                transform: hasChildren && isOpen ? 'rotate(90deg)' : undefined,
              }}
            >
              {<RiArrowRightSLine />}
            </div>
          </div>
        ) : null}
        <div className={'icon-hover'}>
          <div className="icon-wrapper">{icon}</div>
        </div>
        <div className="text-wrapper">{title}</div>
      </div>
    )
  }
  let icon: JSX.Element | null = null
  if (type === 'pin') icon = <RiMapPinLine />
  else icon = nodeTypeIcon(type)
  const hasChildren: boolean = childrenItems.length > 0
  const isSelected: boolean =
    parentNode != null && parentNode.nodeId === node.nodeId && type !== 'pin'
  if (type === 'folder' && isOpen) icon = <RiFolderOpenLine />
  return (
    <div className="treeView-item">
      {changeUrlOnClick ? (
        <Link to={`/${pathToString(node.filePath)}`}>
          <TreeViewChild />
        </Link>
      ) : (
        <TreeViewChild />
      )}
      <div className={`item-children ${isOpen}`}>{childrenItems}</div>
    </div>
  )
}
