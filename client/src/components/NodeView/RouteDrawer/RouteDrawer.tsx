import React, { useEffect, useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverHeader,
  PopoverBody,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  PopoverContent,
  PopoverFooter,
  PopoverCloseButton,
  PopoverArrow,
  Select,
  ButtonGroup,
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
  InputGroup,
  InputLeftElement,
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
  makeIPinProperty,
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

  const handleRemoveTempPin = async (event: any) => {
    const el = document.getElementById('route-drawer-pin-title')
    const value = el?.getAttribute('data-value')
    console.log(value) // pinId
    let pin: IPin
    if (value) {
      const getPinIdResponse = await FrontendPinGateway.getPin(value)

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

  const [error, setError] = useState<string>('')
  const [title, setTitle] = useState('')
  const [explainer, setExplainer] = useState('')

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
    if (title.length === 0) {
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
    if (trailIdToNavigate) startNavigation(trailIdToNavigate)
    setRouteDrawerOpen(false)
    setIsNavigating(true)
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

  const [tabIndex, setTabIndex] = useRecoilState(tabIndexState)
  const [specificTrail, setSpecificTrail] = useRecoilState(specificTrailState)

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  const handleCreateTabClick = () => {
    setTabIndex(0)
  }

  return (
    <>
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
                          style={{ padding: '10px 10px' }}
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
                                  key={pin.pinId}
                                  className="pins-added-list-wrapper"
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
                                      onClick={(e) => handleRemoveTempPin(e)}
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
                    <div className="specific-trail-wrapper">
                      <div className="specific-trail-title">{specificTrail.title}</div>
                      <div className="specific-trail-explainer">
                        {specificTrail.explainer}
                      </div>
                      <div className="specific-trail-pins">
                        {specificTrail.pinList.map((pin, index) => (
                          <div className="specific-trail-pin-title" key={index}>
                            {index + 1}. {pin.title}{' '}
                          </div>
                        ))}
                      </div>
                      Going to format this tomorrow morning—Zaul
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
                                  <div className="trail-card-container">
                                    <div className="trail-card-title">{trail.title}</div>
                                    <div className="trail-card-explainer">
                                      {trail.explainer}
                                    </div>
                                    <hr></hr>
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
                              <option key={trail.trailId} value={trail.trailId}>
                                {trail.title}
                              </option>
                            ))}
                        </Select>
                        <Button onClick={handleStartNavigationClick} colorScheme="green">
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
