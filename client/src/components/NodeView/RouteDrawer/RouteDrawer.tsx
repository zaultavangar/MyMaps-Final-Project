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
} from '@chakra-ui/react'
import FocusLock from 'react-focus-lock'
import { FrontendPinGateway } from '../../../pins'
import { IPin, INode, isSamePin, ITrail, failureServiceResponse } from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import { DeleteIcon } from '@chakra-ui/icons'

import './RouteDrawer.scss'
import { valueToPercent } from '@mui/base'
import { generateObjectId } from '../../../global'
import { currentNodeState } from '../../../global/Atoms'
import { FrontendTrailGateway } from '../../../trails'
import TitleIcon from '@mui/icons-material/Title'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import CloseIcon from '@mui/icons-material/Close'

interface IRouteDrawerProps {
  isOpen: boolean
  onClose: () => void
  pins: IPin[]
  load: () => void
  currentNode: INode
  trails: ITrail[]
  setTrails: (trail: ITrail[]) => void
  setPins: (pin: IPin[]) => void
  setRouteDrawerOpen: (b: boolean) => void
  setSelectedPin:(pin: IPin | null) => void
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
    setRouteDrawerOpen,
    setSelectedPin,
    setIsNavigating,
    startNavigation,
  } = props

  const [routeDrawerPins, setRouteDrawerPins] = useState<IPin[] | null>([])
  const [dbTrails, setDbTrails] = useState<ITrail[] | null>([])

  useEffect(() => {
    console.log('hi')
    setRouteDrawerPins(pins)
  }, [isOpen])

  useEffect(() => {
    console.log(routeDrawerPins)
    if (routeDrawerPins && routeDrawerPins.length > 0) {
      setPinIdToAdd(routeDrawerPins[0].pinId)
      if (trails && trails.length>0) {
        settrailIdToNavigate(trails[0].trailId)
      }
    }
  }, [routeDrawerPins])

  const [createModeTitle, setCreateModeTitle] = useState('')

  const handleCreateModeTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreateModeTitle(event.target.value)
  }

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
        console.log(addIndex)
        newPins.splice(addIndex - 1, 0, pin)
        // newPins.push(pin)
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
  const maxInputVal = val

  return (
    <>
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Route Menu</DrawerHeader>
          <DrawerBody>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Create</Tab>
                <Tab>View</Tab>
                <Tab>Navigate</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Input
                    value={createModeTitle}
                    onChange={handleCreateModeTitleChange}
                    placeholder="Route title..."
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
                            <NumberInput
                              value={addIndex}
                              onChange={handleNumberInputChange}
                              width="45%"
                              defaultValue={maxInputVal}
                              max={maxInputVal}
                              min={1}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
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
                      <Popover
                        placement="right"
                        isOpen={createTrailPopoverOpen}
                        onClose={() => setCreateTrailPopoverOpen(false)}
                      >
                        <PopoverTrigger>
                          <div className="create-trail-button-wrapper">
                            <Button
                              colorScheme="whatsapp"
                              onClick={onCreateTrailPopoverClick}
                              style={{ padding: '10px 10px' }}
                            >
                              Create Trail
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverHeader>Create a Trail</PopoverHeader>
                          <PopoverCloseButton />
                          <PopoverBody>
                            <FocusLock returnFocus persistentFocus={false}>
                              <InputGroup sx={{ marginBottom: '10px' }}>
                                <InputLeftElement pointerEvents="none">
                                  <TitleIcon />
                                </InputLeftElement>
                                <Input
                                  placeholder="Choose a Title"
                                  onChange={handleTitleChange}
                                />
                              </InputGroup>
                              <InputGroup sx={{ marginBottom: '10px' }}>
                                <Textarea
                                  placeholder="Enter a Description (optional)"
                                  onChange={handleExplainerChange}
                                />
                              </InputGroup>
                            </FocusLock>
                          </PopoverBody>
                          <PopoverFooter display="flex" justifyContent="flex-end">
                            <ButtonGroup size="sm">
                              <Button
                                variant="outline"
                                onClick={(e) => setCreateTrailPopoverOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleCreateTrail} colorScheme="green">
                                Create
                              </Button>
                            </ButtonGroup>
                          </PopoverFooter>
                        </PopoverContent>
                      </Popover>
                    )}
                    {/* <Snackbar
                      open={showTrailCreatedAlert}
                      autoHideDuration={5000}
                      onClose={handleAlertClose}
                      message="Trail created!"
                      action={()=> console.log('hi')}
                    /> */}
                    {/* {showTrailCreatedAlert && dbTrails && dbTrails.length>0 &&
                    <div>
                      <Box sx={{ width: '50%' }}>
                        <Collapse in={showTrailCreatedAlert}>
                          <Alert
                            sx={{ mb: 2 }}
                          >
                            Trail Created!
                          </Alert>
                        </Collapse>
                    </Box>
                    </div>
                    } */}
                  </div>
                  {/**
                   * Add popover on Create trail Click with option to add a
                   * title and explainer to the new trail
                   */}
                  <div
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
                      <div
                        key={pin.pinId}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px solid grey',
                          borderRadius: '5px',
                          padding: '10px 10px',
                        }}
                      >
                        <div>{index + 1}. </div>

                        <div id="route-drawer-pin-title" data-value={pin.pinId}>
                          {pin.title}
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
                    ))}
                  </div>
                </TabPanel>
                <TabPanel>
                  <h2 style={{fontWeight: 'bold'}}>My Routes</h2>
                  <div className='trail-card-wrapper'>
                  {trails.map(trail=>
                  <>
                  <Popover size='xs' trigger='hover' placement='bottom'>
                  <PopoverTrigger>
                    <div className='trail-card-container'>
                        <div className='trail-card-title'>
                          {trail.title}
                        </div>
                        <div className='trail-card-explainer'>
                          {trail.explainer}
                        </div>
                        <hr></hr>
                      </div>
                  </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverHeader>
                        <div style={{fontWeight: 'lighter'}}>
                            Drag and drop pins to change order
                        </div>
                      </PopoverHeader>
                      <PopoverBody>
                      <div style={{display:'flex', flexDirection: 'column' ,gap: '1em'}}>
                          {trail.pinList.map(pin => 
                            <div 
                              id={pin.pinId}
                              onClick={(e)=>handlePinFromTrailClick(e, pin.pinId)}
                              data-value= {pin.pinId}
                              style={{display:'flex', 
                                flexDirection: 'row', 
                                gap: '1em', cursor: 'pointer'}} >
                            <PlaceIcon/>
                            {pin.title}
                            </div>
                            )}
                      </div>
                      </PopoverBody>
                    </PopoverContent>
                   </Popover>
                    </>
                    )}
                    </div>
                    
                </TabPanel>
                <TabPanel>
                  <div>
                    <h2 style={{marginBottom: '5px'}}>Choose a Route for Navigation Mode: </h2>
                    <div style={{display: 'flex', gap: '1em'}}>
                    <Select
                      width='fit-content'
                      value={trailIdToNavigate}
                      id="select-navigate-trail"
                      onChange={handleTrailNavigateSelectChange}
                    >
                      {trails && trails.map(trail =>
                        <option value={trail.trailId}>{trail.title}</option>
                      )}
                    </Select>
                    <Button onClick={handleStartNavigationClick} colorScheme="green">
                        Navigate
                    </Button>
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
