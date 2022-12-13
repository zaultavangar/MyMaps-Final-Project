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
  refreshLinkListState,
} from '../../../global/Atoms'
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

  const [routeDrawerPins, setRouteDrawerPins] = useState<IPin[] | null>([])
  const [dbTrails, setDbTrails] = useState<ITrail[] | null>([])

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  const [confirmationOpen, setConfirmationOpen] = useRecoilState(confirmationOpenState)

  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  useEffect(() => {
    console.log('hi')
    setRouteDrawerPins(pins)
  }, [isOpen])

  useEffect(() => {
    console.log(routeDrawerPins)
    if (routeDrawerPins && routeDrawerPins.length > 0) {
      setPinIdToAdd(routeDrawerPins[0].pinId)
      if (trails && trails.length > 0) {
        settrailIdToNavigate(trails[0].trailId)
      }
    }
  }, [routeDrawerPins])

  const getPinsForMap = async () => {}

  const [pinsAdded, setPinsAdded] = useState<IPin[]>([])
  const [pinIdToAdd, setPinIdToAdd] = useState<string>('')
  const [trailIdToNavigate, settrailIdToNavigate] = useState<string>('')

  const [addPinPopoverOpen, setAddPinPopoverOpen] = useState(false)
  const [addIndex, setAddIndex] = useState<number>(pinsAdded.length)
  const [createTrailPopoverOpen, setCreateTrailPopoverOpen] = useState(false)

  const [showTrailCreatedAlert, setShowTrailCreatedAlert] = useState(false)

  useEffect(() => {
    console.log('hi')
    setShowTrailCreatedAlert(true)
  }, [dbTrails])

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

  const handleTrailNavigateSelectChange = (event: any) => {
    settrailIdToNavigate(event.target.value)
  }

  const handleAddPinsToTrail = async (e: any) => {
    console.log(pinIdToAdd)
    if (pinIdToAdd) {
      const getPinIdResponse = await FrontendPinGateway.getPin(pinIdToAdd)
      console.log(getPinIdResponse)
      let pin: IPin
      if (getPinIdResponse.success && getPinIdResponse.payload) {
        pin = getPinIdResponse.payload
        console.log(pin)
        const newPins = pinsAdded.slice()
        newPins.push(pin)
        console.log(newPins)
        setPinsAdded(newPins)
        setAddPinPopoverOpen(false)
        const routePinsCopy = routeDrawerPins?.slice()
        if (routePinsCopy !== undefined) {
          for (let i = 0; i < routePinsCopy.length; i++) {
            console.log(routePinsCopy[i], pin)
            if (isSamePin(routePinsCopy[i], pin)) {
              console.log('add: is same pin')
              routePinsCopy.splice(i, 1)
            }
          }
          setRouteDrawerPins(routePinsCopy)
        }
      } else {
        console.log('fail')
      }
    }
  }

  const handleRemoveTempPin = async (pinId: string) => {
    let pin: IPin
    if (pinId) {
      const getPinIdResponse = await FrontendPinGateway.getPin(pinId)

      if (getPinIdResponse.success && getPinIdResponse.payload) {
        pin = getPinIdResponse.payload
        console.log(pin)
        const newPins = pinsAdded.slice()
        for (let i = 0; i < newPins.length; i++) {
          if (isSamePin(newPins[i], pin)) {
            console.log('remove: is same pin')
            newPins.splice(i, 1)
          }
        }
        setPinsAdded(newPins)

        const routePinsCopy = routeDrawerPins?.slice()
        if (routePinsCopy) {
          routePinsCopy.push(pin)
          setRouteDrawerPins(routePinsCopy)
        }
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
      setConfirmationOpen(false)
    }
  }

  const [tabIndex, setTabIndex] = useRecoilState(tabIndexState)
  const [specificTrail, setSpecificTrail] = useRecoilState(specificTrailState)

  const [error, setError] = useState<string>('')
  const [explainer, setExplainer] = useState(specificTrail ? specificTrail.explainer : '')
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

  const handleNumberInputChange = (vString: string, vNumber: number) => {
    console.log(pinsAdded.length)
    console.log(vNumber)
    setAddIndex(vNumber)
  }

  const onCreateTrailPopoverClick = () => {
    console.log('hi')
    setCreateTrailPopoverOpen(true)
  }

  const handleCreateTrail = async () => {
    if (!title || title.length === 0) {
      setError('Error: No title')
      return
    }
    console.log(title)

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
        console.log('error')
        setAlertIsOpen(true)
        setAlertTitle('Title update failed')
        setAlertMessage(updateResp.message)
      }
    }
    setCreateTrailPopoverOpen(false)
    setTabIndex(1)
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
    if (trailIdToNavigate) {
      startNavigation(trailIdToNavigate)
      setRouteDrawerOpen(false)
      setIsNavigating(true)
    }
  }

  // useEffect(() => {
  //   setDbTrails(trails)
  // }, [handleCreateTrail])

  const val: number = pinsAdded.slice().length + 1

  const onDragEnd = (result: DropResult) => {
    console.log(result)
    const { source, destination } = result
    if (!destination) return

    const items = Array.from(pinsAdded)
    const [newOrder] = items.splice(source.index, 1)
    items.splice(destination.index, 0, newOrder)

    setPinsAdded(items)
  }

  const createTrailClass =
    pinsAdded.length > 0 ? 'create-trail-button-wrapper' : 'disabled-button-wrapper'

  const getPinItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    background: isDragging ? 'black' : 'white',
    color: isDragging ? 'white' : 'black',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    border: '1px solid grey',
    borderRadius: '5px',
    padding: '10px 10px',
    width: '200px',

    ...draggableStyle,
  })

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  const handleCreateTabClick = () => {
    setTabIndex(0)
  }

  const [editingTitle, setEditingTitle] = useState<boolean>(false)
  const [editingExplainer, setEditingExplainer] = useState<boolean>(false)

  //
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
      // setRefresh(!refresh)
      setRefreshLinkList(!refreshLinkList)
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
      // setRefresh(!refresh)
      // setRefreshLinkList(!refreshLinkList)
    }
  }

  const cancelConfirmationRef = React.useRef(null)

  const [confirmationType, setConfirmationType] = useState('')
  const [pinToDelete, setPinToDelete] = useState<IPin | null>(null)

  const handleOpenConfirmationAlert = (pin: IPin) => {
    setConfirmationType('deletePinFromTrail')
    setConfirmationOpen(true)
    setPinToDelete(pin)
  }

  const ConfirmationAlert = () => {
    return (
      <AlertDialog
        isOpen={confirmationOpen}
        leastDestructiveRef={cancelConfirmationRef}
        onClose={() => setConfirmationOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {confirmationType === 'deletePinFromTrail' && <>Delete Pin from Trail</>}
            </AlertDialogHeader>

            <AlertDialogBody>
              {confirmationType === 'deletePinFromTrail' && specificTrail && (
                <>
                  Are you sure you want to delete <b>{pinToDelete!.title}</b> from{' '}
                  <b style={{ color: 'green' }}>{specificTrail.title}</b>?
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
              <div>
                <Button
                  ref={cancelConfirmationRef}
                  colorScheme="red"
                  onClick={() => handleRemovePinFromTrail(pinToDelete!)}
                  ml={3}
                >
                  Delete
                </Button>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    )
  }

  const smallCustomButtonStyle = {
    height: 25,
    width: 30,
    backgroundColor: 'rgb(241, 241, 241)',
    color: 'black',
    font: '20',
  }

  const [selectedTrail, setSelectedTrail] = useRecoilState(specificTrailState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)
  const onDeleteButtonClick = async () => {
    if (selectedTrail) {
      const deleteResp = await FrontendTrailGateway.deleteTrail(selectedTrail.trailId)
      if (!deleteResp.success) {
        setAlertIsOpen(true)
        setAlertTitle('Failed to delete trail')
        setAlertMessage(deleteResp.message)
      }
      setRefreshLinkList(!refreshLinkList)
      setSelectedTrail(null)
    }
  }

  console.log(confirmationOpen)
  return (
    <>
      {confirmationOpen && <ConfirmationAlert />}

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
                          onClick={() => setAddPinPopoverOpen(true)}
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
                              {routeDrawerPins &&
                                routeDrawerPins.map((pin) => (
                                  <option key={pin.pinId} value={pin.pinId}>
                                    {pin.title}
                                  </option>
                                ))}
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
                    {pinsAdded.length > 0 && (
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
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="pinsAdded" direction="horizontal">
                      {(provided) => (
                        <div
                          className="pinsAdded"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            marginTop: '15px',
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: '1em',
                            marginLeft: '20px',
                          }}
                        >
                          {pinsAdded.map((pin, index) => (
                            <Draggable
                              key={pin.pinId}
                              draggableId={pin.pinId}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className="pins-list-wrapper"
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
                                      id="route-drawer-pin-title"
                                      key={pin.pinId}
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
                                      onClick={(e) => handleRemoveTempPin(pin.pinId)}
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
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId="trailPins" direction="horizontal">
                            {(provided) => (
                              <div
                                className="trailPins"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{
                                  marginTop: '15px',
                                  display: 'flex',
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: '1em',
                                  marginLeft: '20px',
                                }}
                              >
                                {specificTrail.pinList.map((pin, index) => (
                                  <Draggable
                                    key={pin.pinId}
                                    draggableId={pin.pinId}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        // key={pin.pinId}
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
                                            key={pin.pinId}
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
                                              handleOpenConfirmationAlert(pin)
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
                                onClick={() => setAddPinPopoverOpen(true)}
                                style={{
                                  marginLeft: '5px',
                                  marginTop: '10px',
                                  padding: '40px 30px',
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: '200' }}>Add Pins</div>
                                  <div style={{ fontSize: '1.5em', fontWeight: '200' }}>
                                    +
                                  </div>
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
                                    {routeDrawerPins &&
                                      routeDrawerPins.map((pin) => (
                                        <option key={pin.pinId} value={pin.pinId}>
                                          {pin.title}
                                        </option>
                                      ))}
                                  </Select>
                                  <div>
                                    <Button
                                      colorScheme="whatsapp"
                                      backgroundColor="rgb(0,125,0)"
                                      onClick={async () => {
                                        const pin = (
                                          await FrontendPinGateway.getPin(pinIdToAdd)
                                        ).payload
                                        if (pin) {
                                          specificTrail.pinList.push(pin)
                                        }
                                      }}
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
                        {/* <div className="specific-trail-pins" style={{display: 'flex', flexWrap: 'wrap', gap: '1em',}}>
                            {specificTrail.pinList.map((pin, index) => (
                              <div className="specific-trail-pin-title" key={index}>
                                {index + 1}. {pin.title}{' '}
                              </div>
                            ))}
                          </div> */}
                      </div>
                      <div className="trail-card-delete">
                        <Button
                          style={{
                            backgroundColor: 'rgb(241,241,241)',
                            fontSize: '14px',
                            marginTop: '15px',
                          }}
                          onClick={() => onDeleteButtonClick()}
                        >
                          <RiDeleteBin6Fill /> Delete Trail
                        </Button>
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
