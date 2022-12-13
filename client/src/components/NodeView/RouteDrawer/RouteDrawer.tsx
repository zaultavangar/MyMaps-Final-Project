import React, { useEffect, useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverCloseButton,
  PopoverArrow,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  Input,
  DrawerFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Textarea,
  Text,
} from '@chakra-ui/react'
import FocusLock from 'react-focus-lock'
import { FrontendPinGateway } from '../../../pins'
import {
  IPin,
  INode,
  isSamePin,
  ITrail,
  IPinProperty,
  ITrailProperty,
  makeIPinProperty,
  makeITrailProperty,
  failureServiceResponse,
} from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import { DeleteIcon } from '@chakra-ui/icons'

import './RouteDrawer.scss'
import { valueToPercent } from '@mui/base'
import { generateObjectId } from '../../../global'
import {
  currentNodeState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  routeDrawerOpenState,
  tabIndexState,
  specificTrailState,
  confirmationOpenState,
  confirmationTypeState,
  refreshLinkListState,
  trailPinsState,
  refreshTrailsState,
  refreshPinsState,
  mapPinsState,
} from '../../../global/Atoms'
import { ConfirmationAlert } from '../../ConfirmationAlert'
import { FrontendTrailGateway } from '../../../trails'
import TitleIcon from '@mui/icons-material/Title'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import CloseIcon from '@mui/icons-material/Close'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { selectedPinState } from '../../../global/Atoms'
import { DropResult, DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { EditableText } from '../../EditableText'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import { arrayMoveImmutable } from 'array-move'

interface IRouteDrawerProps {
  isOpen: boolean
  onClose: () => void
  pins: IPin[]
  load: () => void
  currentNode: INode
  trails: ITrail[]
  setTrails: (trail: ITrail[]) => void
  setPins: (pin: IPin[]) => void
  setIsNavigating: (b: boolean) => void
  startNavigation: (s: string) => void
}

export const RouteDrawer = (props: IRouteDrawerProps) => {
  const {
    isOpen,
    onClose,
    pins,
    load,
    currentNode,
    trails,
    setTrails,
    setIsNavigating,
    startNavigation,
  } = props

  const setRouteDrawerOpen = useSetRecoilState(routeDrawerOpenState)

  const [dbTrails, setDbTrails] = useState<ITrail[] | null>([])

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
  const [confirmationType, setConfirmationType] = useState<string>('')

  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  const [pinsAdded, setPinsAdded] = useState<IPin[]>([])

  const [pinsAddedExistingTrail, setPinsAddedExistingTrail] = useState<IPin[]>([])

  const [trailPins, setTrailPins] = useRecoilState(trailPinsState)

  const [pinIdToAdd, setPinIdToAdd] = useState<string>('')
  const [pinIdToAddExisitingTrail, setPinIdToAddExistingTrail] = useState<string>('')

  const [trailIdToNavigate, settrailIdToNavigate] = useState<string>('')

  const [addPinPopoverOpen, setAddPinPopoverOpen] = useState(false)
  const [addIndex, setAddIndex] = useState<number>(pinsAdded.length)
  const [createTrailPopoverOpen, setCreateTrailPopoverOpen] = useState(false)

  const [showTrailCreatedAlert, setShowTrailCreatedAlert] = useState(false)

  const [mapPins, setMapPins] = useRecoilState(mapPinsState)

  const [selectedTrail, setSelectedTrail] = useRecoilState(specificTrailState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)
  const [refreshTrails, setRefreshTrails] = useRecoilState(refreshTrailsState)
  const [refreshPins, setRefreshPins] = useRecoilState(refreshPinsState)

  const [tabIndex, setTabIndex] = useRecoilState(tabIndexState)
  const [specificTrail, setSpecificTrail] = useRecoilState(specificTrailState)

  const [error, setError] = useState<string>('')
  const [explainer, setExplainer] = useState(specificTrail ? specificTrail.explainer : '')

  useEffect(() => {
    if (tabIndex == 2) {
      settrailIdToNavigate(trails[0].trailId)
    }
    setExplainer('')
    setTitle('')
    setPinsAdded([])
  }, [isOpen, tabIndex])

  useEffect(() => {
    if (specificTrail) {
      setPinsAddedExistingTrail(specificTrail.pinList)
    }
  }, [specificTrail])

  const getPinsForMap = async () => {}

  const handleAlertClose = (event: any, reason: any) => {
    if (reason === 'clickaway') return
    setShowTrailCreatedAlert(false)
  }

  const setPopoverOpen = () => {
    setAddPinPopoverOpen(true)
  }

  const handleSelectChange = (event: any) => {
    setPinIdToAdd(event.target.value)
  }

  const handleExistingTrailSelectChange = (event: any) => {
    setPinIdToAddExistingTrail(event.target.value)
  }

  const handleTrailNavigateSelectChange = (event: any) => {
    settrailIdToNavigate(event.target.value)
  }
  const handleAddPinsToExistingTrail = async (e: any) => {
    if (pinIdToAddExisitingTrail && specificTrail) {
      const getPinIdResponse = await FrontendPinGateway.getPin(pinIdToAddExisitingTrail)
      let pin: IPin
      if (getPinIdResponse.success && getPinIdResponse.payload) {
        pin = getPinIdResponse.payload
        const newPins = pinsAddedExistingTrail.slice()
        newPins.push(pin)

        console.log(newPins)
        const newProperty: ITrailProperty = makeITrailProperty('pinList', newPins)
        const updateResp = await FrontendTrailGateway.updateTrail(specificTrail.trailId, [
          newProperty,
        ])
        if (!updateResp.success) {
          return failureServiceResponse('Failed to add pin to trail')
        }
        setTrailPins(newPins)
        setPinsAddedExistingTrail(newPins)
        setAddPinPopoverOpen(false)
        setRefreshPins(!refreshPins)
        setRefreshTrails(!refreshTrails)
      }
    }
    // const currentPinList = specificTrail!.pinList
    // const getTrailResp = await FrontendTrailGateway.getTrail(specificTrail!.trailId)
    // if (getTrailResp.success && getTrailResp.payload) {
    //   let pinList = getTrailResp.payload
    //   let difference = pinList.filter(pin => !mapPins.includes())

    // }
  }

  const handleAddPinsToTrail = async (e: any) => {
    if (pinIdToAdd) {
      const getPinIdResponse = await FrontendPinGateway.getPin(pinIdToAdd)
      let pin: IPin
      if (getPinIdResponse.success && getPinIdResponse.payload) {
        pin = getPinIdResponse.payload
        // console.log(pin)
        const newPins = pinsAdded.slice()
        newPins.push(pin)
        console.log(newPins)
        setPinsAdded(newPins)
        setAddPinPopoverOpen(false)
        setRefreshPins(!refreshPins)
        setRefreshTrails(!refreshTrails)
      }
    }
  }

  const handleRemovePinFromTrail = async (pin: IPin) => {
    const trailPinList = specificTrail?.pinList.slice()
    if (trailPinList && specificTrail) {
      for (let i = 0; i < trailPinList.length; i++) {
        if (isSamePin(trailPinList[i], pin)) {
          trailPinList.splice(i, 1)
        }
      }
      // console.log(trailPinList)
      const trailProperty: ITrailProperty = makeITrailProperty('pinList', trailPinList)
      const updateTrailResp = await FrontendTrailGateway.updateTrail(
        specificTrail.trailId,
        [trailProperty]
      )
      if (!updateTrailResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Trail update failed')
        setAlertMessage(updateTrailResp.message)
      }
      const trailsCpy = trails.slice()
      setConfirmationOpen(false)
      setRefreshTrails(!refreshTrails)
      setRefreshPins(!refreshPins)
      // setTrails(trailsCpy)
      setTrailPins(trailPinList)
    }
  }

  useEffect(() => {
    if (specificTrail) setExplainer(specificTrail.explainer)
  }, [specificTrail])

  const [title, setTitle] = useState(specificTrail ? specificTrail.title : '')
  useEffect(() => {
    if (specificTrail) setTitle(specificTrail.title)
  }, [specificTrail])

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error.length > 0 && event.target.value.length > 0) setError('')
    setTitle(event.target.value)
  }

  const handleExplainerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExplainer(event.target.value)
  }

  const onCreateTrailPopoverClick = () => {
    // console.log('hi')
    setCreateTrailPopoverOpen(true)
  }

  const handleCreateTrail = async () => {
    if (!title || title.length === 0) {
      setError('Error: No title')
      return
    }
    // console.log(title)

    const newTrail: ITrail = {
      trailId: generateObjectId('trail'),
      pinList: pinsAdded,
      nodeId: currentNode.nodeId,
      title: title,
      explainer: explainer,
    }
    const trailResponse = await FrontendTrailGateway.createTrail(newTrail)
    if (!trailResponse.success) {
      setError('Error: Failed to create trail')
      return
    }
    const trailsCpy = trails.slice()
    trailsCpy.push(newTrail)
    setTrails(trailsCpy)
    for (let i = 0; i < pinsAdded.length; i++) {
      const pinProperty: IPinProperty = makeIPinProperty('trails', pinsAdded)
      const updateResp = await FrontendPinGateway.updatePin(pinsAdded[i].pinId, [
        pinProperty,
      ])
      if (!updateResp.success) {
        // console.log('error')
        setAlertIsOpen(true)
        setAlertTitle('Title update failed')
        setAlertMessage(updateResp.message)
      }
    }
    setCreateTrailPopoverOpen(false)
    setTabIndex(1)
    setSpecificTrail(newTrail)
  }

  const handlePinFromTrailClick = async (e: any, pinId: string) => {
    if (pinId) {
      const getPinResp = await FrontendPinGateway.getPin(pinId)
      if (getPinResp.success && getPinResp.payload) {
        const pin = getPinResp.payload
        setRouteDrawerOpen(false)
        setSelectedPin(pin)
      }
    }
  }

  const handleStartNavigationClick = () => {
    if (trailIdToNavigate.length > 0) {
      startNavigation(trailIdToNavigate)
      setRouteDrawerOpen(false)
      setIsNavigating(true)
    }
  }

  const val: number = pinsAdded.slice().length + 1

  const onViewDragEnd = (result: DropResult) => {
    // console.log(result)
    const { source, destination } = result
    if (!destination) return

    if (trailPins) {
      const items = Array.from(trailPins)
      const [newOrder] = items.splice(source.index, 1)
      items.splice(destination.index, 0, newOrder)

      setTrailPins(items)
      setRefreshPins(!refreshPins)
      setRefreshTrails(!refreshTrails)
    }
  }

  const createTrailClass =
    pinsAdded.length > 0 ? 'create-trail-button-wrapper' : 'disabled-button-wrapper'

  const getPinItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    background: isDragging ? 'black' : 'white',
    color: isDragging ? 'white' : 'black',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid grey',
    borderRadius: '5px',
    padding: '5px 20px',
    width: '300px',

    ...draggableStyle,
  })

  const handleTabsChange = (index: number) => {
    if (index == 2) {
      setSpecificTrail(null)
    } else if (index == 0) {
      setSpecificTrail(null)
    }
    console.log(index)
    setTabIndex(index)
  }

  const handleCreateTabClick = () => {
    setSpecificTrail(null)
    setTabIndex(0)
  }

  const [editingTitle, setEditingTitle] = useState<boolean>(false)
  const [editingExplainer, setEditingExplainer] = useState<boolean>(false)

  const handleUpdateTitle = async (title: string) => {
    if (specificTrail) {
      setTitle(title)
      const trailProperty: ITrailProperty = makeITrailProperty('title', title)
      const updateResp = await FrontendTrailGateway.updateTrail(specificTrail.trailId, [
        trailProperty,
      ])
      if (!updateResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Title update failed')
        setAlertMessage(updateResp.message)
      }
      setRefreshPins(!refreshPins)
      setRefreshTrails(!refreshTrails)
    }
  }

  const handleUpdateExplainer = async (explainer: string) => {
    if (specificTrail) {
      setExplainer(explainer)
      const trailProperty: ITrailProperty = makeITrailProperty('explainer', explainer)
      const updateResp = await FrontendTrailGateway.updateTrail(specificTrail.trailId, [
        trailProperty,
      ])
      if (!updateResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Explainer update failed')
        setAlertMessage(updateResp.message)
      }
    }
  }

  useEffect(() => {
    const trail = specificTrail
    if (trail) setTrailPins(trail.pinList)
  }, [specificTrail])

  const cancelConfirmationRef = React.useRef(null)

  const [pinToDelete, setPinToDelete] = useState<IPin | null>(null)
  const [trailToDelete, setTrailToDelete] = useState<ITrail | null>(null)

  const handlePinOpenConfirmationAlert = (pin: IPin) => {
    setConfirmationType('deletePinFromTrail')
    setConfirmationOpen(true)
    setPinToDelete(pin)
  }

  const handleTrailOpenConfirmationAlert = () => {
    setConfirmationType('deleteTrail')
    setConfirmationOpen(true)
  }

  const onDeleteTrailButtonClick = async () => {
    if (specificTrail) {
      const deleteResp = await FrontendTrailGateway.deleteTrail(specificTrail.trailId)
      if (!deleteResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Failed to delete trail')
        setAlertMessage(deleteResp.message)
      }
      setConfirmationOpen(false)
      setSpecificTrail(null)
      setRefreshTrails(!refreshTrails)
      setRefreshPins(!refreshPins)
    }
  }

  const smallCustomButtonStyle = {
    height: 25,
    width: 30,
    backgroundColor: 'rgb(241, 241, 241)',
    color: 'black',
    font: '20',
  }

  const handleSpecificTrailClick = (trail: ITrail) => {
    setSpecificTrail(trail)
  }

  const handleAddClick = (e: any) => {
    if (pins.length > 0) setPinIdToAdd(pins[0].pinId)
    setAddPinPopoverOpen(true)
  }

  const handleAddExistingClick = (e: any) => {
    if (pins.length > 0) setPinIdToAddExistingTrail(pins[0].pinId)
    setAddPinPopoverOpen(true)
  }

  return (
    <>
      {confirmationOpen && (
        <ConfirmationAlert
          isOpen={confirmationOpen}
          setOpen={setConfirmationOpen}
          confirmationType={confirmationType}
          specificTrail={specificTrail}
          pinToDelete={pinToDelete}
          handleRemovePinFromTrail={handleRemovePinFromTrail}
          onDeleteTrailButtonClick={onDeleteTrailButtonClick}
        />
      )}

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Route Menu</DrawerHeader>
          <DrawerBody>
            <Tabs index={tabIndex} onChange={handleTabsChange} variant="enclosed">
              <TabList>
                <Tab>Create</Tab>
                <Tab>View</Tab>
                <Tab>Navigate</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Input
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Route title..."
                    style={{ marginBottom: '10px' }}
                  />
                  <Textarea
                    value={explainer}
                    placeholder="Enter a Description (optional)"
                    onChange={handleExplainerChange}
                  />
                  <div className="add-pin-to-trail-popover-container">
                    <Popover
                      placement="right"
                      isOpen={addPinPopoverOpen}
                      onClose={() => setAddPinPopoverOpen(false)}
                    >
                      <PopoverTrigger>
                        <Button
                          className="add-pins-to-trail-button"
                          variant="outline"
                          mr={3}
                          onClick={handleAddClick}
                          style={{
                            marginLeft: '5px',
                            marginTop: '10px',
                            padding: '40px 30px',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '200' }}>Add Pins</div>
                            <div style={{ fontSize: '1.5em', fontWeight: '200' }}>+</div>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Choose a Pin</PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverBody>
                          <div className="select-add-pin-wrapper">
                            <Select
                              value={pinIdToAdd}
                              id="select-add-pin"
                              onChange={handleSelectChange}
                            >
                              <>
                                {pins &&
                                  pins.map((pin) => (
                                    <option key={pin.pinId} value={pin.pinId}>
                                      {pin.title}
                                    </option>
                                  ))}
                              </>
                            </Select>
                            <div>
                              <Button
                                colorScheme="whatsapp"
                                backgroundColor="rgb(0,125,0)"
                                onClick={handleAddPinsToTrail}
                                style={{ padding: '10px 10px' }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </PopoverBody>
                        <PopoverFooter></PopoverFooter>
                      </PopoverContent>
                    </Popover>
                    {pins.length > 0 && (
                      <div className="create-trail-button-wrapper">
                        <Button
                          colorScheme="whatsapp"
                          onClick={handleCreateTrail}
                          style={{
                            padding: '10px 10px',
                            backgroundColor: 'rgb(0, 125, 0)',
                          }}
                        >
                          Create Route
                        </Button>
                      </div>
                    )}
                    {error.length > 0 && (
                      <div
                        className="modal-error modal-error-create-trail"
                        style={{ marginLeft: '-5px' }}
                      >
                        {error}
                      </div>
                    )}
                  </div>
                  <div
                    className="pins-added-sortable-wrapper"
                    style={{ marginTop: '10px' }}
                  >
                    <ul id="sortList">
                      {pinsAdded.map((pin, index) => (
                        <li key={pin.pinId}>{pin.title}</li>
                      ))}
                    </ul>
                  </div>
                  <div
                    style={{
                      marginTop: '15px',
                      marginLeft: '10px',
                      fontSize: '0.8em',
                      fontWeight: '250',
                    }}
                  >
                    Drag and drop your added pins to change the pin order within your
                    route.
                  </div>
                </TabPanel>
                <TabPanel>
                  {specificTrail ? (
                    <div>
                      <Button
                        onClick={() => setSpecificTrail(null)}
                        style={{
                          backgroundColor: 'rgb(241,241,241)',
                          fontSize: '14px',
                          marginTop: '15px',
                          marginBottom: '15px',
                        }}
                      >
                        See all routes
                      </Button>
                      <div className="specific-trail-wrapper">
                        <div>
                          <h2
                            className="specific-trail-title"
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
                            className="specific-trail-explainer"
                            style={{ marginLeft: '10px' }}
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
                        <DragDropContext onDragEnd={onViewDragEnd}>
                          <Droppable droppableId="trailPins">
                            {(provided) => (
                              <div
                                className="trailPins"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{
                                  marginTop: '15px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  flexWrap: 'wrap',
                                  gap: '10px',
                                  marginLeft: '20px',
                                  maxHeight: '500px',
                                }}
                              >
                                {trailPins &&
                                  trailPins.map((pin, index) => (
                                    <Draggable
                                      draggableId={pin.pinId}
                                      index={index}
                                      key={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          key={pin.pinId}
                                          className="pins-list-wrapper specific-trail-pins"
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getPinItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                          )}
                                        >
                                          <div>
                                            <div>{index + 1}. </div>
                                            <div
                                              id="route-drawer-specific-pin-title"
                                              data-value={pin.pinId}
                                            >
                                              <b>{pin.title}</b>
                                            </div>
                                          </div>

                                          <div
                                            style={{
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                            }}
                                          >
                                            <IconButton
                                              onClick={() =>
                                                handlePinOpenConfirmationAlert(pin)
                                              }
                                              className="delete-icon"
                                              style={{ marginLeft: '10px' }}
                                              size="s"
                                              aria-label="Search database"
                                              icon={<DeleteIcon />}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                        {/* <div className="specific-trail-pins" style={{display: 'flex', flexWrap: 'wrap', gap: '1em',}}>
                            {specificTrail.pinList.map((pin, index) => (
                              <div className="specific-trail-pin-title" key={index}>
                                {index + 1}. {pin.title}{' '}
                              </div>
                            ))}
                          </div> */}
                      </div>
                      <div
                        className="trail-card-delete"
                        style={{
                          display: 'flex',
                          gap: '1em',
                          marginTop: '10px',
                          marginLeft: '15px',
                        }}
                      >
                        <Button
                          style={{
                            backgroundColor: 'rgb(241,241,241)',
                            fontSize: '14px',
                          }}
                          onClick={handleTrailOpenConfirmationAlert}
                        >
                          <RiDeleteBin6Fill /> Delete Trail
                        </Button>
                        <div className="add-pin-to-existing-trail-popover-container">
                          <Popover
                            placement="right"
                            isOpen={addPinPopoverOpen}
                            onClose={() => setAddPinPopoverOpen(false)}
                          >
                            <PopoverTrigger>
                              <Button
                                className="add-pins-to-existing-trail-button"
                                onClick={handleAddExistingClick}
                                style={{
                                  backgroundColor: 'green',
                                  color: 'white',
                                  fontSize: '14px',
                                  padding: '10px 10px',
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: '200' }}>Add Pins</div>
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverHeader>Choose a Pin</PopoverHeader>
                              <PopoverCloseButton />
                              <PopoverBody>
                                <div className="select-add-pin-wrapper">
                                  <Select
                                    value={pinIdToAddExisitingTrail}
                                    id="select-add-pin"
                                    onChange={handleExistingTrailSelectChange}
                                  >
                                    <>
                                      {pins &&
                                        pins.map((pin) => (
                                          <option key={pin.pinId} value={pin.pinId}>
                                            {pin.title}
                                          </option>
                                        ))}
                                    </>
                                  </Select>
                                  <div>
                                    <Button
                                      colorScheme="whatsapp"
                                      backgroundColor="rgb(0,125,0)"
                                      onClick={handleAddPinsToExistingTrail}
                                      style={{ padding: '10px 10px' }}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </PopoverBody>
                              <PopoverFooter></PopoverFooter>
                            </PopoverContent>
                          </Popover>

                          {error.length > 0 && (
                            <div
                              className="modal-error modal-error-create-trail"
                              style={{ marginLeft: '-5px' }}
                            >
                              {error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        My Routes
                      </h2>
                      {trails.length > 0 ? (
                        <div className="trail-card-wrapper">
                          {trails.map((trail) => (
                            <>
                              <Popover size="xs" trigger="hover" placement="bottom">
                                <PopoverTrigger>
                                  <div
                                    className="trail-card-container"
                                    onClick={() => setSpecificTrail(trail)}
                                  >
                                    <div className="trail-card-title">{trail.title}</div>
                                    <div className="trail-card-explainer">
                                      {trail.explainer}
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverHeader></PopoverHeader>
                                  <PopoverBody>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1em',
                                      }}
                                    >
                                      {trail.pinList.map((pin) => (
                                        <div
                                          key={pin.pinId}
                                          id={pin.pinId}
                                          onClick={(e) =>
                                            handlePinFromTrailClick(e, pin.pinId)
                                          }
                                          data-value={pin.pinId}
                                          className="trail-view-pin-list-item-wrapper"
                                          style={{
                                            padding: '10px 5px',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <PlaceIcon />
                                          {pin.title}
                                        </div>
                                      ))}
                                    </div>
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            </>
                          ))}
                        </div>
                      ) : (
                        <div>
                          No routes have been add for this map. Want to
                          <span
                            onClick={handleCreateTabClick}
                            className="add-a-route-link"
                          >
                            {' '}
                            <u>add a route?</u>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </TabPanel>
                <TabPanel>
                  {trails.length > 0 ? (
                    <div>
                      <h2 style={{ marginBottom: '5px' }}>
                        Choose a Route for Navigation Mode:{' '}
                      </h2>
                      <div style={{ display: 'flex', gap: '1em' }}>
                        <Select
                          width="fit-content"
                          value={trailIdToNavigate}
                          id="select-navigate-trail"
                          onChange={handleTrailNavigateSelectChange}
                          defaultValue={trails[0].pinList[0].title}
                        >
                          {trails &&
                            trails.map((trail) => (
                              <>
                                {trail.pinList.length > 0 && (
                                  <option key={trail.trailId} value={trail.trailId}>
                                    {trail.title}
                                  </option>
                                )}
                              </>
                            ))}
                        </Select>
                        <Button
                          onClick={handleStartNavigationClick}
                          colorScheme="green"
                          style={{ backgroundColor: 'rgb(0,125,0)' }}
                        >
                          Navigate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      This map has no routes through which to navigate. Want to
                      <span onClick={handleCreateTabClick} className="add-a-route-link">
                        {' '}
                        <u>add a route?</u>
                      </span>
                    </div>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
