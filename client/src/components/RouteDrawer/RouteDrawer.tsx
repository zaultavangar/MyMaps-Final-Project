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
  Tabs, TabList, TabPanels, Tab, TabPanel, Stack,
  Popover, PopoverTrigger, PopoverAnchor, PopoverHeader, PopoverBody, PopoverContent,
  PopoverFooter, PopoverCloseButton, PopoverArrow, Select
} from "@chakra-ui/react"
import { FrontendPinGateway } from '../../pins'
import { IPin, isSamePin } from '../../types'
import PlaceIcon from '@mui/icons-material/Place'


import './RouteDrawer.scss'


interface IRouteDrawerProps {
  isOpen: boolean
  onClose: () => void
  pins: IPin[]
  load: () => void
}


export const RouteDrawer =(props: IRouteDrawerProps) => {
  const { isOpen, onClose, pins, load } = props

  const [routeDrawerPins, setRouteDrawerPins] = useState<IPin[] | null>([])

  useEffect(() => {
    console.log('hi')
    setRouteDrawerPins(pins)
  }, [isOpen])

  useEffect(() => {
    console.log(routeDrawerPins)
    if (routeDrawerPins && routeDrawerPins.length>0) setPinIdToAdd(routeDrawerPins[0].pinId)
  }, [routeDrawerPins])

  const [createModeTitle, setCreateModeTitle] = useState('')

  const handleCreateModeTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreateModeTitle(event.target.value)
  }

  const getPinsForMap = async () => {

  }

  const [pinsAdded, setPinsAdded] = useState<IPin[]>([])
  const [pinIdToAdd, setPinIdToAdd] = useState<string>("")
  const [addPinPopoverOpen, setAddPinPopoverOpen ] = useState(false);

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
        let newPins = pinsAdded.slice()
        newPins.push(pin)
        console.log(newPins)
        setPinsAdded(newPins)
        setAddPinPopoverOpen(false)
        let routePinsCopy = routeDrawerPins?.slice()
        if (routePinsCopy !== undefined) {
          for (let i=0; i<routePinsCopy.length; i++) {
            console.log(routePinsCopy[i], pin)
            if (isSamePin(routePinsCopy[i], pin)){
           
              routePinsCopy.splice(i, 1)
            }
          }
          setRouteDrawerPins(routePinsCopy)

        }
      }
      else {
        console.log('fail')
      }
    }
   
    
  }




  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='bottom'
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Route Menu</DrawerHeader>
          <DrawerBody>
          <Tabs variant='enclosed'>
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
              <div style={{display: "flex", alignItems: 'center'}}>
              <Popover
                placement='right'
                isOpen = {addPinPopoverOpen}
                >
                <PopoverTrigger>
                  <Button 
                  variant='outline' mr={3} onClick={()=>setAddPinPopoverOpen(true)}
                  style={{marginLeft: "5px", marginTop: "10px", 
                    padding: "40px 30px"}}
                    >
                    <div>
                      <div style={{fontWeight:"200"}}>Add Pins</div>
                      <div style={{fontSize:"1.5em", fontWeight:"200"}}>+</div>
                    </div>
                </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverHeader>Choose a Pin</PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <div className="select-add-pin-wrapper">
                      <Select value={pinIdToAdd} id="select-add-pin" onChange={handleSelectChange}>
                          {routeDrawerPins && routeDrawerPins.map(pin => 
                            <option value={pin.pinId}>{pin.title}</option>
                          )
                          }
                      </Select>
                      <Button 
                        colorScheme='whatsapp'
                        onClick={handleAddPinsToTrail}
                        style={{padding: "10px 10px"}}>
                          Add
                      </Button>

                    </div>
                  </PopoverBody>
                  <PopoverFooter>
                    
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
              <div>
                {pinsAdded.map(pin =>
                  <div style={{display: "flex", justifyContent:'center', alignItems: 'center', border: '1px solid black', borderRadius: '5px',
                    padding: "10px 10px"}}>
                      <div>{pin.title}</div>
                      <div><PlaceIcon/></div>
                  </div>
                )
                }
              </div>
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
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}