import React, { useEffect, useRef, useState, useCallback } from 'react'
import PlaceIcon from '@mui/icons-material/Place'
import TitleIcon from '@mui/icons-material/Title'
import { fetchLinks } from '..'
import { useHistory } from 'react-router-dom'
import './MapContent.scss'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import {
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
  selectedPinState,
  currentNodeState,
  startAnchorState,
  refreshLinkListState,
} from '../../../../global/Atoms'
import { FrontendAnchorGateway } from '../../../../anchors'
import { FrontendPinGateway } from '../../../../pins'
import { FrontendNodeGateway } from '../../../../nodes'
import {
  IAnchor,
  IImageExtent,
  IPin,
  NodeFields,
  INodeProperty,
  makeINodeProperty,
} from '../../../../types'
import './MapContent.scss'
import {
 Popover, 
 PopoverBody,
 PopoverContent,
 PopoverCloseButton,
 PopoverHeader, 
 PopoverArrow,
 PopoverFooter,
 PopoverTrigger,
  ButtonGroup,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Textarea,

} from '@chakra-ui/react'
import { generateObjectId } from '../../../../global'

import { format } from 'path'
import { createNodeIdsToNodesMap } from '../../../MainView';
import { setUncaughtExceptionCaptureCallback } from 'process';
import FocusLock from 'react-focus-lock';
import { RiNurseFill } from 'react-icons/ri'


interface IMapContentProps {}

/** The content of a map node, including any pins */
export const MapContent = () => {

  const [ createPinPopoverOpen, setCreatePinPopoverOpen ] = useState(false)


  const startAnchor = useRecoilValue(startAnchorState)

  // recoil state management
  const currentNode = useRecoilValue(currentNodeState)
  const refreshLinkList = useRecoilValue(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [error, setError] = useState<string>('')

  const content = currentNode.content

  // Manage state of images with resizing
  const [updatedWidth, setUpdatedWidth] = useState<number>(currentNode.updatedWidth ?? 0)
  const [updatedHeight, setUpdatedHeight] = useState<number>(
    currentNode.updatedHeight ?? 0
  )

  /* State variable to keep track of anchors rendered on image */
  const [mapPins, setMapPins] = useState<JSX.Element[]>([])
  const [startAnchorVisualization, setStartAnchorVisualization] = useState<JSX.Element>()

  const [xLast, setXLast] = useState<number>(0)
  const [yLast, setYLast] = useState<number>(0)

  /**
   * useRef Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   *
   * TODO [Editable]: This is the component that we would want to resize
   */
  const imageContainer = useRef<HTMLHeadingElement>(null)

  /* This is how we can access currently selected region for making links */
  const selection = useRef<HTMLHeadingElement>(null)

  const history = useHistory()

  const [title, setTitle] = useState('')
  const [explainer, setExplainer] = useState('')
  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)
  const [selectedPinId, setSelectedPinId] = useState<string | null>('')

  /**
   * Method to handle creating a pin on the map image when the user clicks on the image
   * @param event
   * @returns
   */
  const handleCreatePin = async () => {
    console.log(xLast)
    console.log(yLast)
    const newPin = {
      pinId: generateObjectId('pin'),
      nodeId: currentNode.nodeId,
      trails: [],
      childNodes: [],
      title: title,
      explainer: explainer,
      topJustify: yLast,
      leftJustify: xLast
      ,
    }

    const pinResponse = await FrontendPinGateway.createPin(newPin)
    if (!pinResponse.success) {
      setError('Error: Failed to create pin')
      return
    }
    setCreatePinPopoverOpen(false)
    // add state fxn calls to refresh pin menu and other things that need to be refreshed
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleExplainerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExplainer(event.target.value)
  }


  /**
   * Handle click on anchor that is displayed on image
   * Single click: Select the anchor
   * Double click: Navigate to the opposite node
   */
  const handlePinSelect = async (e: React.MouseEvent, pin: IPin) => {
    e.stopPropagation()
    e.preventDefault()
    switch (e.detail) {
      // Left click to set selected pin
      case 1:
        if (selectedPin === null) {
          setSelectedPin && setSelectedPin(pin)
        }
        else {
          setSelectedPin && setSelectedPin(null)
        }
        break
    }
  }

  const displaySelectedPin = useCallback(() => {
    if (selectedPinId) {
      const prevSelectedPin = document.getElementById(selectedPinId)
      if (prevSelectedPin) {
        prevSelectedPin.style.color = "black" // reset to base color
      }
    }
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    let newSelectedPinId: string | null = null
    if (selectedPin) {
      const pinElement = document.getElementById(selectedPin.pinId)
      if (pinElement) {
        pinElement.style.color = "blue"
        pinElement.style.transform="scale(1.2)"
        newSelectedPinId = pinElement.id
      }
    }
    setSelectedPinId(newSelectedPinId)
  }, [selectedPinId, selectedPin])

  /**
   * To trigger on load and when we setSelectedExtent
   */
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
    if (selection.current) {
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
  }, [setSelectedExtent, refreshLinkList])

  useEffect(() => {
    displaySelectedPin()
  }, [selectedPin]) // eventually add refreshPinMenu dependency

  useEffect(() => {
    displayMapPins()
  }, [selectedPin, currentNode, refreshLinkList, mapPins]) // startAmcjpr

  useEffect(() => {
    setUpdatedWidth(currentNode.updatedWidth ?? 0)
    setUpdatedHeight(currentNode.updatedHeight ?? 0)
  }, [currentNode])

  /**
   * onPointerDown initializes the creation of a new pin on the map image
   * @param e
   */
  const onPointerDown = (e: React.PointerEvent) => {

    if (createPinPopoverOpen === false) {
      e.preventDefault()
      e.stopPropagation()
      // dragging = true
      // The y location of the image top in the browser
      const imageTop = imageContainer.current?.getBoundingClientRect().top
      // The x location of the image left in the browser
      const imageLeft = imageContainer.current?.getBoundingClientRect().left
  
      const x = e.clientX // The x location of the pointer in the browser
      const y = e.clientY // The y location of the poitner in the browser
  
      // calculate the x and y location of the pointer relative to the image

      let xPosLast = x + 10 - imageLeft!
      let yPosLast = y - 2 - imageTop!
      // Set the initial x and y location of the selection
      if (selection.current) {
        selection.current.style.display = "unset"
        console.log(xPosLast)
        console.log(yPosLast)
        selection.current.style.left = `${xPosLast}px`
        selection.current.style.top = `${yPosLast}px`
        console.log('createpin')
        setCreatePinPopoverOpen(true)
        setXLast(xPosLast)
        setYLast(yPosLast)
      }
    }
  }


  useEffect(() => {
    // this code ensures that an extent selected on one node doesn't display on another node
    setSelectedExtent(null)
    if (selection.current) {
      // Note: This is a rather hacky solution to hide the selected region
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
    // this code visualizes the start anchor
    if (
      startAnchor != null &&
      startAnchor != undefined &&
      startAnchor.nodeId == currentNode.nodeId &&
      startAnchor.extent?.type == 'image'
    ) {
      setStartAnchorVisualization(
        <div
          id={'startAnchor'}
          key={'image.startAnchor'}
          className="image-anchor"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          style={{
            height: startAnchor.extent?.height,
            left: startAnchor.extent.left,
            top: startAnchor.extent.top,
            width: startAnchor.extent.width,
          }}
        />
      )
    } else {
      setStartAnchorVisualization(<div></div>)
    }
  }, [currentNode, startAnchor])

  /**
   * This method displays the existing anchors. We are fetching them from
   * the data with a call to FrontendAnchorGateway.getAnchorsByNodeId
   * which returns a list of IAnchors that are on currentNode
   */
  const displayMapPins = async (): Promise<void> => {
    let mapPins: IPin[]
    const pinsFromNode = await FrontendPinGateway.getPinsByNodeId(
      currentNode.nodeId
    )
    if (pinsFromNode.success && pinsFromNode.payload) {
      const pinElementList: JSX.Element[] = []
      // List of anchor elements to return
      mapPins = pinsFromNode.payload
      // IAnchor array from FrontendAnchorGateway call
      mapPins.forEach((pin) => {
        console.log('ljust: ', `${pin.leftJustify}px`)
        console.log('tjust: ', `${pin.topJustify}px`)
        
        // selection

        pinElementList.push(
          <div 
            id={pin.pinId}
            key={'map.' + pin.pinId}
            onClick={(e)=> {
              handlePinSelect(e, pin)
            }}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="pins-on-map-wrapper"
            style= {{
              left: `${pin.leftJustify}px`, // change these variable names
              top: `${pin.topJustify}px`
            }}
            > 
              <PlaceIcon 
                color="primary"/>
          </div>
        )
      })
      setMapPins(pinElementList)
    }
  }

  const handleCreatePinPopoverClose = () => {
    if (selection.current) {
      selection.current.style.display = "none"
    }
    setCreatePinPopoverOpen(false)
  }

  return (
    <div className="mapImageWrapper" id="mapImageWrapper">
      <div
        ref={imageContainer}
        onPointerDown={onPointerDown}
        className="map-image-content-wrapper"
        id="map-image-content-wrapper"
        style={{ width: updatedWidth, height: updatedHeight }}
      >
        {startAnchorVisualization}
        {mapPins}
        {
          <div>
            <Popover
              returnFocusOnClose={false}
              isOpen={createPinPopoverOpen}
              onClose={handleCreatePinPopoverClose}
              placement='right'
              closeOnBlur={false}
            >
              <PopoverTrigger>
                <div className="selection" ref={selection}>
                  <PlaceIcon style={{color: "black"}}/>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader fontWeight='semibold'>Create a Pin</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <FocusLock returnFocus persistentFocus={false}>
                    <InputGroup sx={{marginBottom: '10px'}}>
                      <InputLeftElement
                        pointerEvents='none'
                        children={<TitleIcon/>}
                      />
                      <Input placeholder='Choose a Title' onChange={handleTitleChange}/>
                    </InputGroup>
                    <InputGroup sx={{marginBottom: '10px'}}>
                      <Textarea placeholder='Enter a Description (optional)' onChange={handleExplainerChange}/>
                    </InputGroup>
                  </FocusLock>
                  If Google Maps, location should prob pop up automatically with optional title
                </PopoverBody>
                <PopoverFooter display='flex' justifyContent='flex-end'>
                <ButtonGroup size='sm'>
                  <Button variant='outline'>Cancel</Button>
                  <Button onClick = {handleCreatePin} colorScheme='green'>Create</Button>
                  </ButtonGroup>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
          </div>
          
        }
        <img src={content} />
      </div>
    </div>
    // <div className="textWrapper">

    // </div>
  )
}
