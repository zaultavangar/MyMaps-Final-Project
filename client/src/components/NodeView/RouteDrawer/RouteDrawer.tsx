import React, { useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  useDisclosure,
  Input,
  DrawerFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverHeader,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverCloseButton,
  PopoverArrow,
  Select,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { FrontendPinGateway } from '../../../pins'
import { IPin, INode, isSamePin, ITrail } from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import { DeleteIcon } from '@chakra-ui/icons'

import './RouteDrawer.scss'
import { valueToPercent } from '@mui/base'
import { generateObjectId } from '../../../global'
import { currentNodeState } from '../../../global/Atoms'
import { FrontendTrailGateway } from '../../../trails'

interface IRouteDrawerProps {
  isOpen: boolean
  onClose: () => void
  pins: IPin[]
  load: () => void
  currentNode: INode
  trails: ITrail[]
  setTrails: (trail: ITrail[]) => void
}

export const RouteDrawer = (props: IRouteDrawerProps) => {
  const { isOpen, onClose, pins, load, currentNode, trails, setTrails } = props

  const [routeDrawerPins, setRouteDrawerPins] = useState<IPin[] | null>([])

  useEffect(() => {
    console.log('hi')
    setRouteDrawerPins(pins)
  }, [isOpen])

  useEffect(() => {
    console.log(routeDrawerPins)
    if (routeDrawerPins && routeDrawerPins.length > 0) {
      setPinIdToAdd(routeDrawerPins[0].pinId)
      }
  }, [routeDrawerPins])

  const [createModeTitle, setCreateModeTitle] = useState('')

  const handleCreateModeTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreateModeTitle(event.target.value)
  }

  const getPinsForMap = async () => {}

  const [pinsAdded, setPinsAdded] = useState<IPin[]>([])
  const [pinIdToAdd, setPinIdToAdd] = useState<string>('')
  const [addPinPopoverOpen, setAddPinPopoverOpen] = useState(false)
  const [addIndex, setAddIndex] = useState<number>(pinsAdded.length)

  const setPopoverOpen = () => {
    setAddPinPopoverOpen(true)
  }

  const handleSelectChange = (event: any) => {
    setPinIdToAdd(event.target.value)
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

  const handleNumberInputChange = (vString: string, vNumber: number) => {
    console.log(pinsAdded.length)
    console.log(vNumber)
    setAddIndex(vNumber)
  }

  const handleCreateTrail = async () => {
    const newTrail: ITrail = {
      trailId: generateObjectId('trail'),
      pinList: pinsAdded,
      nodeId: currentNode.nodeId,
      title: '',
      explainer: '',
    }
    const trailResponse = await FrontendTrailGateway.createTrail(newTrail)
    if (!trailResponse.success){
      setError('Error: Failed to create trail')
      return
    }
    let trailsCpy = trails.slice()
    trailsCpy.push(newTrail)
    setTrails(trailsCpy)
  }

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
                  <Popover
                    placement="right"
                    isOpen={addPinPopoverOpen}
                    onClose={() => setAddPinPopoverOpen(false)}
                  >
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        mr={3}
                        onClick={setPopoverOpen}
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
                                <option value={pin.pinId}>{pin.title}</option>
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
                    <div className="create-trail-button-wrapper">
                      <Button
                        colorScheme="whatsapp"
                        onClick={handleCreateTrail}
                        style={{ padding: '10px 10px' }}
                      >
                        Create Trail
                      </Button>
                    </div>
                  )}
                  {/**
                   * Add popover on Create trail Click with option to add a 
                   * title and explainer to the new trail 
                   */}
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: '1em',
                    }}
                  >
                    {pinsAdded.map((pin, index) => (
                      <div
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
                  <p>View all routes...</p>
                </TabPanel>
                <TabPanel>
                  <p>Navigate: navigate gate through the pins in a trail</p>
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
