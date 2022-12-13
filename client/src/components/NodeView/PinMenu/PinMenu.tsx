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
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Divider,
} from '@chakra-ui/react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
import { pathToString, nodeTypeIcon } from '../../../global'
import { AddToRouteModal, CreateNodeModal } from '../../Modals'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'
import { EditableText } from '../../EditableText'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  refreshLinkListState,
  refreshTrailsState,
  refreshPinsState,
  refreshState,
  mapPinsState,
  selectedPinState,
  routeDrawerOpenState,
  tabIndexState,
  specificTrailState,
  addToRouteModalOpenState,
  confirmationOpenState,
  confirmationTypeState
} from '../../../global/Atoms'
import { FrontendTrailGateway } from '../../../trails'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import { ConfirmationAlert } from '../../ConfirmationAlert'

interface IPinMenuProps {
  setParentNode: (node: INode) => void
  onCreateNodeButtonClick: () => void
}

export const PinMenu = (props: IPinMenuProps) => {
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
  const [confirmationType, setConfirmationType] = useState<string>('')

  const { setParentNode, onCreateNodeButtonClick } = props

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)
  const icon = nodeTypeIcon('map') // icon based on type
  const [mapPins, setMapPins] = useRecoilState(mapPinsState)

  const setRouteDrawerOpen = useSetRecoilState(routeDrawerOpenState)
  const setSpecificTrail = useSetRecoilState(specificTrailState)
  // const setAddToRouteModalOpen = useSetRecoilState(addToRouteModalOpenState)

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
    backgroundColor: 'gainsboro',
    paddingTop: '10px',
    paddingBottom: '10px',
  }

  const smallCustomButtonStyle = {
    height: 25,
    width: 30,
    backgroundColor: 'rgb(241, 241, 241)',
    color: 'black',
  }

  /**
   * Added in these from NodeHeader to make the pin title and explainer editable! :D
   */
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)
  const [refreshTrails, setRefreshTrails] = useRecoilState(refreshTrailsState)
  const [refreshPins, setRefreshPins] = useRecoilState(refreshPinsState)
  const setTabIndex = useSetRecoilState(tabIndexState)

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
      setRefreshPins(!refreshPins)
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
      setRefreshPins(!refreshPins)
      setRefreshTrails(!refreshTrails)
    }
  }
  
  const handleOpenConfirmationAlert = () => {
    console.log(selectedPin)
    setConfirmationType('deletePin')
    setConfirmationOpen(true)
  }

  const onDeleteButtonClick = async () => {
    // update trails
    if (selectedPin) {
      const deleteResp = await FrontendPinGateway.deletePin(selectedPin.pinId)
      if (!deleteResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Failed to delete pin')
        setAlertMessage(deleteResp.message)
      }
      setRefreshPins(!refreshPins)
      setRefreshTrails(!refreshTrails)
      setSelectedPin(null)
    }
  }

  const onAddToRouteButtonClick = async () => {
    if (selectedPin) {
      console.log('you hit me')
      setAddToRouteModalOpen(true)
    }
  }

  const [trails, setTrails] = useState<ITrail[]>([])
  const trailItems = trails.map((trail: ITrail, index: number) => (
    <div className="pin-menu-trail-card-wrapper" key={trail.trailId}>
      <div className="pin-menu-trail-card-title">{trail.title}</div>
      <div className="pin-menu-trail-card-explainer" style={{ marginLeft: '10px' }}>
        {trail.explainer}
      </div>
    </div>
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

  const handleGoToTrail = (e: any, trail: ITrail) => {
    setSelectedPin(null)
    setRouteDrawerOpen(true)
    setTabIndex(1)
    setSpecificTrail(trail)
  }

  const [seeMoreTrails, setSeeMoreTrails] = useState(false)
  const [addToRouteModalOpen, setAddToRouteModalOpen] = useState(false)

  return (
    <>
    {confirmationOpen && 
      <ConfirmationAlert 
        isOpen={confirmationOpen}
        setOpen={setConfirmationOpen}
        confirmationType={confirmationType}
        pinToDelete={selectedPin}
        onDeletePinButtonClick={onDeleteButtonClick}
      />}
    <div className="pin-menu-container">
      <AddToRouteModal
        isOpen={addToRouteModalOpen}
        onClose={() => setAddToRouteModalOpen(false)}
        onSubmit={() => setAddToRouteModalOpen(false)}
        // setAddToRouteModalOpen={setAddToRouteModalOpen}
        setAddToRouteModalOpen={setAddToRouteModalOpen}
      />
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
                    color={selectedPin == pin ? 'rgb(0,125,0)' : 'primary'}
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
          </div>
          <div
            style={{
              backgroundColor: 'rgb(121, 185, 121)',
              color: 'black',
              padding: '5px 5px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PlaceIcon />
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
              </div>

              <div>
                <div
                  className="pin-menu-delete-pin-wrapper"
                  style={{ marginRight: '20px', fontSize: '0.8em' }}
                >
                  <Button
                    style={smallCustomButtonStyle}
                    icon={<RiDeleteBin6Fill />}
                    // text="Delete Pin"
                    onClick={ handleOpenConfirmationAlert}
                  />
                </div>
              </div>
            </div>

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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '10px 0px',
            }}
          >
            <div
              className="pin-documents"
              style={{ fontWeight: '500', marginLeft: '10px' }}
            >
              Pin Documents
            </div>
            <div style={{ marginRight: '20px' }}>
              <Button
                style={smallCustomButtonStyle}
                icon={<ai.AiOutlineFileAdd />}
                onClick={onCreateNodeButtonClick}
              />
            </div>
          </div>
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
                        <div className="search-list-icon">{nodeTypeIcon(node.type)}</div>
                        <div className="date-created">{formatDate(node.dateCreated)}</div>
                      </div>
                      {node.title}
                    </ListItem>
                  </Link>
                </div>
              ))}
          </List>
          <div
            className="pin-menu-buttons-wrapper"
            style={{
              margin: '10px 0px',
              display: 'flex',
              justifyContent: 'space-evenly',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Button
              text="Add to Route"
              style={customButtonStyle}
              icon={<ri.RiRouteLine />}
              onClick={onAddToRouteButtonClick}
            />
          </div>
          <h4
            className="pin-menu-routes-containing-header"
            style={{ marginTop: '10px', fontWeight: '500' }}
          >
            Routes containing &quot;{selectedPin.title}&quot;
          </h4>
          <div className="routes-containing-wrapper">
            {trails.map((trail, index) => (
              <>
                {(index < 5 || seeMoreTrails) && (
                  <>
                    <div
                      key={index}
                      className="pin-menu-trail-card-wrapper"
                      onClick={(e) => handleGoToTrail(e, trail)}
                    >
                      <div className="pin-menu-trail-card-title">{trail.title}</div>
                      <div
                        className="pin-menu-trail-card-explainer"
                        style={{ marginLeft: '10px' }}
                      >
                        {trail.explainer}
                      </div>
                    </div>
                  </>
                )}
              </>
            ))}
          </div>
          <div
            className="see-more-routes-wrapper"
            style={{
              display: 'flex',
              marginTop: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {trails.length > 5 && (
              <Button
                text={seeMoreTrails ? 'See Less' : 'See More'}
                icon={seeMoreTrails ? <ai.AiFillCaretUp /> : <ai.AiFillCaretDown />}
                onClick={() => setSeeMoreTrails(!seeMoreTrails)}
              />
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
