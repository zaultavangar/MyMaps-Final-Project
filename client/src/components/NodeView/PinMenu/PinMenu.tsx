import React, { useEffect, useState } from 'react'
import './PinMenu.scss'
import { FrontendPinGateway } from '../../../pins'
import {
  IPin,
  INode,
  NodeIdsToNodesMap,
  RecursiveNodeTree,
  IPinProperty,
  makeIPinProperty,
  ITrail,
} from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from '@chakra-ui/react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
import { pathToString, nodeTypeIcon } from '../../../global'
import { CreateNodeModal } from '../../Modals'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'
import { EditableText } from '../../EditableText'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  refreshLinkListState,
  refreshState,
  mapPinsState,
  selectedPinState,
} from '../../../global/Atoms'
import { FrontendTrailGateway } from '../../../trails'

interface IPinMenuProps {
  setParentNode: (node: INode) => void
  onCreateNodeButtonClick: () => void
}

export const PinMenu = (props: IPinMenuProps) => {
  const { setParentNode, onCreateNodeButtonClick } = props

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)
  const icon = nodeTypeIcon('map') // icon based on type
  const [mapPins, setMapPins] = useRecoilState(mapPinsState)

  // Formats a date, could be global method ***
  const formatDate = (date: any) => {
    const dateCreated = new Date(date)
    return dateCreated.toLocaleDateString('en-us')
  }

  const handleLinkClick = (node: INode) => {
    setParentNode(node)
  }

  const customButtonStyle = {
    height: 40,
    width: 150,
    fontSize: '15px',
    paddingTop: '10px',
    paddingBottom: '10px',
  }

  /**
   * Added in these from NodeHeader to make the pin title and explainer editable! :D
   */
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)

  // State variable for current pin title
  const [title, setTitle] = useState(selectedPin?.title)
  useEffect(() => setTitle(selectedPin?.title), [selectedPin])

  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  console.log(`selectedPin.nodeId=${selectedPin?.pinId}`)
  const handleUpdateTitle = async (title: string) => {
    if (selectedPin) {
      setTitle(title)
      const nodeProperty: IPinProperty = makeIPinProperty('title', title)
      const updateResp = await FrontendPinGateway.updatePin(selectedPin.pinId, [
        nodeProperty,
      ])
      if (!updateResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Title update failed')
        setAlertMessage(updateResp.message)
      }
      setRefresh(!refresh)
      setRefreshLinkList(!refreshLinkList)
    }
  }

  // State variable for current pin explainer
  const [explainer, setExplainer] = useState(selectedPin?.explainer)
  useEffect(() => setExplainer(selectedPin?.explainer), [selectedPin])

  // State variable for whether the explainer is being edited
  const [editingExplainer, setEditingExplainer] = useState<boolean>(false)
  const handleUpdateExplainer = async (explainer: string) => {
    if (selectedPin) {
      setExplainer(explainer)
      const nodeProperty: IPinProperty = makeIPinProperty('explainer', explainer)
      const updateResp = await FrontendPinGateway.updatePin(selectedPin.pinId, [
        nodeProperty,
      ])
      if (!updateResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Explainer update failed')
        setAlertMessage(updateResp.message)
      }
      setRefresh(!refresh)
      setRefreshLinkList(!refreshLinkList)
    }
  }

  const onDeleteButtonClick = async () => {
    if (selectedPin) {
      const deleteResp = await FrontendPinGateway.deletePin(selectedPin.pinId)
      if (!deleteResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Failed to delete pin')
        setAlertMessage(deleteResp.message)
      }
      setRefreshLinkList(!refreshLinkList)
      setSelectedPin(null)
    }
  }

  const [trails, setTrails] = useState<ITrail[]>([])
  const trailItems = trails.map((trail: ITrail) => (
    <ListItem key={trail.trailId}>
      <div className="trail-card-container">
        <div className="trail-card-title">{trail.title}</div>
        <div className="trail-card-explainer">{trail.explainer}</div>
        <hr></hr>
      </div>
    </ListItem>
  ))

  const getPinTrails = async (): Promise<void> => {
    if (selectedPin) {
      const resp = await FrontendTrailGateway.getTrailsByPinId(selectedPin.pinId)
      console.log(resp)
      if (resp.success) {
        setTrails(resp.payload ?? [])
      } else {
        setAlertIsOpen(true)
        setAlertTitle('Failed to retrieve trails!')
        setAlertMessage(resp.message)
      }
    }
  }

  useEffect(() => {
    getPinTrails()
  }, [selectedPin])

  return (
    <div className="pin-menu-container">
      {selectedPin === null ? (
        <div>
          <h2 className="your-pins">Your Pins</h2>
          <List>
            {mapPins.map((pin) => (
              <ListItem key={pin.pinId}>
                <div
                  className="pin-menu-item-wrapper"
                  onClick={() => setSelectedPin(pin)}
                >
                  <ListIcon
                    as={PlaceIcon}
                    color={selectedPin == pin ? 'blue' : 'primary'}
                  />
                  {pin.title}
                  <p className="pin-explainer">{pin.explainer}</p>
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      ) : (
        <div>
          <div
            style={{
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              onClick={() => setSelectedPin(null)}
              icon={<ai.AiOutlineArrowLeft />}
              text="Show all pins"
              style={{ backgroundColor: 'white', fontSize: '14px' }}
            />
            <div
              className="pin-menu-delete-pin-wrapper"
              style={{ marginRight: '20px', fontSize: '0.8em' }}
            >
              <Button
                icon={<ri.RiDeleteBin6Line />}
                text="Delete Pin"
                onClick={() => onDeleteButtonClick()}
              />
            </div>
          </div>
          <hr style={{ marginBottom: '10px' }}></hr>
          <div>
            <h2
              className="pin-title pin-selected"
              onDoubleClick={(e) => setEditingTitle(true)}
            >
              <EditableText
                text={title ?? ''}
                editing={editingTitle}
                setEditing={setEditingTitle}
                onEdit={handleUpdateTitle}
              />
            </h2>

            <div
              className="pin-explainer pin-selected"
              onDoubleClick={(e) => setEditingExplainer(true)}
            >
              <EditableText
                text={explainer ?? ''}
                editing={editingExplainer}
                setEditing={setEditingExplainer}
                onEdit={handleUpdateExplainer}
              />
            </div>
          </div>
          <hr style={{ width: '70%', margin: '0 auto' }}></hr>
          <h4 className="pin-documents" style={{ marginTop: '10px', fontWeight: '500' }}>
            Pin Documents
          </h4>
          <List>
            {selectedPin &&
              selectedPin.childNodes.map((node) => (
                <div
                  className={'pin-documents-item-wrapper'}
                  onClick={() => handleLinkClick(node)}
                  key={node.nodeId}
                >
                  <Link to={pathToString(node.filePath)}>
                    <ListItem>
                      <div className="icon-date-wrapper">
                        <div className="search-list-icon">{icon}</div>
                        <div className="date-created">{formatDate(node.dateCreated)}</div>
                      </div>
                      {node.title}
                    </ListItem>
                  </Link>
                </div>
              ))}
          </List>
          <div className="create-node-button-wrapper">
            <Button
              text="Create Node"
              style={customButtonStyle}
              icon={<ai.AiOutlineFileAdd />}
              onClick={onCreateNodeButtonClick}
            />
          </div>
          <div className="add-to-trail-button-wrapper">
            <Button
              text="Add to Trail"
              style={customButtonStyle}
              icon={<ri.RiRouteLine />}
              onClick={onCreateNodeButtonClick}
            />
          </div>
          <h4 className="pin-documents">
            Trails containing &quot;{selectedPin.title}&quot;
          </h4>
          <List>{trailItems}</List>
        </div>
      )}
    </div>
  )
}
