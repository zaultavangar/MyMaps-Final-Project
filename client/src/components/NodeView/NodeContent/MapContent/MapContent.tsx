import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactDOMServer from 'react-dom/server'
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
  makeIGoogleMapPin,
  makeIPin,
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
import { createNodeIdsToNodesMap } from '../../../MainView'
import { setUncaughtExceptionCaptureCallback } from 'process'
import FocusLock from 'react-focus-lock'
import { RiNurseFill } from 'react-icons/ri'
import { GoogleMapContent } from './GoogleMapContent'
// @ts-ignore
import mapboxgl, { Marker, Popup } from '!mapbox-gl'

interface IMapContentProps {
  selectedMapViewMode: string
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin) => void
}

/** The content of a map node, including any pins */
export const MapContent = (props: IMapContentProps) => {
  let map: mapboxgl.Map
  const [newMarker, setNewMarker] = useState<mapboxgl.Marker | null>(null)

  const { selectedMapViewMode, selectedPin, setSelectedPin } = props

  const [createPinPopoverOpen, setCreatePinPopoverOpen] = useState(false)

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
  const [updatedWidth, setUpdatedWidth] = useState<any>(currentNode.updatedWidth ?? 0)
  const [updatedHeight, setUpdatedHeight] = useState<any>(currentNode.updatedHeight ?? 0)

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

  const [selectedPinId, setSelectedPinId] = useState<string | null>('')

  /**
   * Method to handle creating a pin on the map image when the user clicks on the image
   * @param event
   * @returns
   */
  const handleCreatePin = async () => {
    const newPin: IPin = (() => {
      const pinId = generateObjectId('pin')
      const nodeId = currentNode.nodeId
      const trailIds = {} as { [trailId: string]: number };
      if (currentNode.type === 'googleMap') {
        return {
          pinId: pinId,
          nodeId: nodeId,
          trails: [],
          childNodes: [],
          title: title,
          explainer: explainer,
          lat: newMarker.getLngLat().lat,
          lnt: newMarker.getLngLat().lng
        }
      }
      return {
        pinId: pinId,
        nodeId: nodeId,
        trails: [],
        childNodes: [],
        title: title,
        explainer: explainer,
        topJustify: yLast,
        leftJustify: xLast
    }
    })();

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
    setSelectedPin && setSelectedPin(pin)
  }

  const displaySelectedPin = useCallback(() => {
    if (selectedPinId) {
      const prevSelectedPin = document.getElementById(selectedPinId)
      if (prevSelectedPin) {
        prevSelectedPin.style.color = 'black' // reset to base color
        prevSelectedPin.style.transform = 'unset'
      }
    }
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    let newSelectedPinId: string | null = null
    if (selectedPin) {
      const pinElement = document.getElementById(selectedPin.pinId)
      if (pinElement) {
        pinElement.style.color = 'blue'
        pinElement.style.transform = 'scale(1.3)'
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
    if (currentNode.type === 'googleMap') {
      setUpdatedWidth('unset')
      setUpdatedHeight('unset')
    } else {
      setUpdatedWidth(currentNode.updatedWidth ?? 0)
      setUpdatedHeight(currentNode.updatedHeight ?? 0)
    }
  }, [currentNode])

  const PopoverFC: React.FC = () => {
    return (
      <div>
        <InputGroup sx={{ marginBottom: '10px' }}>
          <InputLeftElement pointerEvents="none">
            <TitleIcon />
          </InputLeftElement>
          <Input placeholder="Choose a Title" onChange={handleTitleChange} />
        </InputGroup>
        <InputGroup sx={{ marginBottom: '10px' }}>
          <Textarea
            placeholder="Enter a Description (optional)"
            onChange={handleExplainerChange}
          />
        </InputGroup>
        <ButtonGroup size="sm">
          <Button variant="outline" onClick={(e) => handleCreatePinPopoverClose}>
            Cancel
          </Button>
          <Button onClick={handleCreatePin} colorScheme="green">
            Create
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  const onMapClick = (e: mapboxgl.MapMouseEvent) => {
    const lngLat = e.lngLat

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <Input>Add create pin form here</Input>
        <div>Hi</div>
        `)

    const marker = new mapboxgl.Marker({ color: 'black' })
      .setLngLat(lngLat)
      .addTo(map)
      .setPopup(popup)

    marker.togglePopup()

    setNewMarker(marker)
  }

  const mapStyle = 'mapbox://styles/mapbox/' + selectedMapViewMode

  useEffect(() => {
    if (currentNode.type == 'googleMap') {
      mapboxgl.accessToken =
        'pk.eyJ1IjoiemF1bHQiLCJhIjoiY2xiZjkwcHM5MDN2bzNybWUxbjViZGg5MyJ9.TNLPyVnYb7KKHUfm_XGw5A'
      map = new mapboxgl.Map({
        container: 'map', // container ID
        style: mapStyle, // style URL
        center: [-74.5, 40], // starting position [lng, lat]
        zoom: 5, // starting zoom
      })

      map.on('click', (e: mapboxgl.MapMouseEvent) => {
        onMapClick(e)
      })
    }
  }, [selectedMapViewMode])

  /**
   * onPointerDown initializes the creation of a new pin on the map image
   * @param e
   */
  const onPointerDown = (e: React.PointerEvent) => {
    console.log(e)
    console.log(currentNode.type)
    addEventListener('pointerup', (event) => {
      if (currentNode.type === 'map' && createPinPopoverOpen === false) {
        e.preventDefault()
        e.stopPropagation()
        // dragging = true

        const imageTop = imageContainer.current?.getBoundingClientRect().top
        // The x location of the image left in the browser
        const imageLeft = imageContainer.current?.getBoundingClientRect().left

        const x = e.clientX // The x location of the pointer in the browser
        const y = e.clientY // The y location of the poitner in the browser

        // calculate the x and y location of the pointer relative to the image

        const xPosLast = x + 10 - imageLeft!
        const yPosLast = y - 2 - imageTop!
        // Set the initial x and y location of the selection
        if (selection.current) {
          selection.current.style.display = 'unset'
          selection.current.style.left = `${xPosLast}px`
          selection.current.style.top = `${yPosLast}px`
          setCreatePinPopoverOpen(true)
          setXLast(xPosLast)
          setYLast(yPosLast)
        }

        // The y location of the image top in the browser
      }
    })
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
    const pinsFromNode = await FrontendPinGateway.getPinsByNodeId(currentNode.nodeId)
    if (pinsFromNode.success && pinsFromNode.payload) {
      const pinElementList: JSX.Element[] = []
      // List of anchor elements to return
      mapPins = pinsFromNode.payload
      // IAnchor array from FrontendAnchorGateway call
      mapPins.forEach((pin) => {
        // selection

        pinElementList.push(
          <div
            id={pin.pinId}
            key={'map.' + pin.pinId}
            onClick={(e) => {
              handlePinSelect(e, pin)
            }}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="pins-on-map-wrapper"
            style={{
              left: `${pin.leftJustify}px`, // change these variable names
              top: `${pin.topJustify}px`,
            }}
          >
            <PlaceIcon color="primary" />
          </div>
        )
      })
      setMapPins(pinElementList)
    }
  }

  const handleCreatePinPopoverClose = () => {
    if (currentNode.type === 'googleMap') {
      newMarker.remove()
      setNewMarker(null)
    }

    if (selection.current) {
      selection.current.style.display = 'none'
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
        {currentNode.type === 'map' ? (
          <div>
            {startAnchorVisualization}
            {mapPins}
          </div>
        ) : (
          <div>
            <GoogleMapContent />
          </div>
        )}
        {
          <div>
            <Popover
              returnFocusOnClose={false}
              isOpen={createPinPopoverOpen}
              onClose={handleCreatePinPopoverClose}
              placement="right"
              closeOnBlur={false}
            >
              <PopoverTrigger>
                {currentNode.type === 'map' ? (
                  <div className="selection" ref={selection}>
                    <PlaceIcon style={{ color: 'black' }} />
                  </div>
                ) : (
                  <div></div>
                )}
              </PopoverTrigger>
              <PopoverContent id="popover-content">
                <PopoverHeader fontWeight="semibold">Create a Pin</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <FocusLock returnFocus persistentFocus={false}>
                    <InputGroup sx={{ marginBottom: '10px' }}>
                      <InputLeftElement pointerEvents="none">
                        <TitleIcon />
                      </InputLeftElement>
                      <Input placeholder="Choose a Title" onChange={handleTitleChange} />
                    </InputGroup>
                    <InputGroup sx={{ marginBottom: '10px' }}>
                      <Textarea
                        placeholder="Enter a Description (optional)"
                        onChange={handleExplainerChange}
                      />
                    </InputGroup>
                  </FocusLock>
                  If Google Maps, location should prob pop up automatically with optional
                  title
                </PopoverBody>
                <PopoverFooter display="flex" justifyContent="flex-end">
                  <ButtonGroup size="sm">
                    <Button
                      variant="outline"
                      onClick={(e) => handleCreatePinPopoverClose}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePin} colorScheme="green">
                      Create
                    </Button>
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

