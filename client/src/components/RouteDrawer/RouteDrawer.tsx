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
import './RouteDrawer.scss'
import { IPin } from '../../types'

interface IRouteDrawerProps {
  isOpen: boolean
  onClose: () => void
  pins: IPin[]
}


export const RouteDrawer =(props: IRouteDrawerProps) => {
  const { isOpen, onClose, pins } = props

  const [createModeTitle, setCreateModeTitle] = useState('')

  const handleCreateModeTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreateModeTitle(event.target.value)
  }

  const getPinsForMap = async () => {

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
              <Popover
                placement='right'
                >
                <PopoverTrigger>
                  <Button 
                  variant='outline' mr={3} 
                  style={{marginLeft: "5px", marginTop: "10px", 
                    padding: "40px 30px"}}>
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
                      <Select placeholder="Choose pin">
                          {pins.map(pin => 
                            <option value={pin.pinId}>{pin.title}</option>
                          )
                          }
                      </Select>
                      <Button 
                        colorScheme='whatsapp'
                        style={{padding: "10px 10px"}}>
                          Add
                      </Button>
                    </div>
                  </PopoverBody>
                  <PopoverFooter>
                    
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
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