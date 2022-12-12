import { Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ri from 'react-icons/ri'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { generateObjectId } from '../../../global'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  currentNodeState,
  isLinkingState,
  isNavigatingState,
  refreshLinkListState,
  refreshState,
  selectedNodeState,
  trailToNavigateState,
} from '../../../global/Atoms'
import { FrontendNodeGateway } from '../../../nodes'
import { FrontendTrailGateway } from '../../../trails'
import {
  IFolderNode,
  INode,
  ITrail,
  INodeProperty,
  makeINodeProperty,
} from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './NodeHeader.scss'
import { RouteDrawer } from '../RouteDrawer'

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  onGraphViewClick: () => void
  onRouteMenuClick: () => void
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    onDeleteButtonClick,
    onMoveButtonClick,
    onHandleStartLinkClick,
    onRouteMenuClick,
    onHandleCompleteLinkClick,
    onGraphViewClick,
  } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const isLinking = useRecoilValue(isLinkingState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)

  // State variable for current node title
  const [title, setTitle] = useState(currentNode.title)
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      'viewType',
      (e.currentTarget as any).value as any
    )
    const updateViewResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('View not updated')
      setAlertMessage(updateViewResp.message)
    }
  }

  // LAB TASK 8
  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    setTitle(title)
    const nodeProperty: INodeProperty = makeINodeProperty('title', title)
    const titleUpdateResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (!titleUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Title update failed')
      setAlertMessage(titleUpdateResp.message)
    }
    setRefresh(!refresh)
    setRefreshLinkList(!refreshLinkList)
  }

  // LAB TASK 9
  /* Method called on title right click */
  const handleTitleRightClick = () => {
    ContextMenuItems.splice(0, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'titleRename'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          setEditingTitle(true)
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">ctrl + shift + R</div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode])

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
      case 'Escape':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
    }
    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case 'R':
          e.preventDefault()
          setEditingTitle(true)
          break
      }
    }
  }

  // Trigger on node load or when editingTitle changes
  useEffect(() => {
    document.addEventListener('keydown', nodeKeyHandlers)
  }, [editingTitle])

  const folder: boolean = currentNode.type === 'folder'
  const map: boolean = currentNode.type === 'map' || currentNode.type === 'googleMap'
  const notRoot: boolean = currentNode.nodeId !== 'root'

  const routeMenuButtonRef = React.useRef()

  const isNavigating = useRecoilValue(isNavigatingState)

  const [trailToNavigate, setTrailToNavigate] = useRecoilState(trailToNavigateState)

  return (
    <div
      className="nodeHeader"
      style={{ backgroundColor: isNavigating ? 'green' : 'white' }}
    >
      <div
        className="nodeHeader-title"
        onDoubleClick={(e) => setEditingTitle(true)}
        onContextMenu={handleTitleRightClick}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
        />
      </div>
      <div
        className="nodeHeader-buttonBar-wrapper"
        style={{
          width: '100%',
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginRight: '10px',
        }}
      >
        {notRoot && (
          <div className="nodeHeader-buttonBar">
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiDragDropLine />}
              text="Move"
              onClick={() => onMoveButtonClick(currentNode)}
            />
            {!map && (
              <Button
                icon={<ri.RiExternalLinkLine />}
                text="Start Link"
                onClick={onHandleStartLinkClick}
              />
            )}
            {!map && (
              <Button
                icon={<ri.RiEyeFill />}
                text="Graph View"
                onClick={() => onGraphViewClick()}
              />
            )}
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            {map && (
              <Button
                text="Route Menu"
                icon={<ri.RiMapPinLine />}
                onClick={onRouteMenuClick}
              />
            )}
            {folder && (
              <div className="select">
                <Select
                  bg="f1f1f1"
                  defaultValue={(currentNode as IFolderNode).viewType}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </div>
            )}
          </div>
        )}
        {trailToNavigate && (
          <div className="navigating-from" style={{ color: 'white' }}>
            Navigating from <b>{trailToNavigate.title}</b>
          </div>
        )}
      </div>
    </div>
  )
}
