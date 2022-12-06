import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fa from 'react-icons/fa'
import * as ri from 'react-icons/ri'
import PlaceIcon from '@mui/icons-material/Place'
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import { fetchLinks } from '..'
import { useHistory } from 'react-router-dom'
import './MapContent.scss'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import {
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
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
  const [imageAnchors, setImageAnchors] = useState<JSX.Element[]>([])
  const [startAnchorVisualization, setStartAnchorVisualization] = useState<JSX.Element>()

  let dragging: boolean = false // Indicated whether we are currently dragging the image
  let currentTop: number // To store the top of the currently selected region for onPointerMove
  let currentLeft: number // To store the left of the currently selected region for onPointerMove
  let xLast: number
  let yLast: number

  /**
   * useRef Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   *
   * TODO [Editable]: This is the component that we would want to resize
   */
  const imageContainer = useRef<HTMLHeadingElement>(null)

  /* This is how we can access currently selected region for making links */
  const selection = useRef<HTMLHeadingElement>(null)

  /**
   * State variable to keep track of the currently selected anchor IDs
   * Use: Compare with selectedAnchors to update previous state
   */
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([])
  const history = useHistory()

  const [title, setTitle] = useState('')
  const [explainer, setExplainer] = useState('')

  /**
   * Method to handle creating a pin on the map image when the user clicks on the image
   * @param event
   * @returns
   */
  const handleCreatePin = async () => {
    const newPin = {
      pinId: generateObjectId('pin'),
      nodeId: currentNode.nodeId,
      trails: [],
      childNodes: [],
      title: title,
      explainer: explainer,
    }

    const pinResponse = await FrontendPinGateway.createPin(newPin)
    if (!pinResponse.success) {
      setError('Error: Failed to create pin')
      return
    }
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
  const handleAnchorSelect = async (e: React.MouseEvent, anchor: IAnchor) => {
    e.stopPropagation()
    e.preventDefault()
    switch (e.detail) {
      // Left click to set selected anchors
      case 1:
        setSelectedAnchors && setSelectedAnchors([anchor])
        setSelectedExtent(anchor.extent)
        break
      // Double click to navigate to node
      case 2:
        const links = await fetchLinks(anchor.anchorId)
        if (links.length > 0) {
          if (links[0].anchor1Id !== anchor.anchorId) {
            history.push(`/${links[0].anchor1NodeId}/`)
            const anchor1 = await FrontendAnchorGateway.getAnchor(links[0].anchor1Id)
            if (anchor1.success && anchor1.payload) {
              setSelectedAnchors([anchor1.payload])
              setSelectedExtent(anchor1.payload.extent)
            }
          } else if (links[0].anchor2Id !== anchor.anchorId) {
            history.push(`/${links[0].anchor2NodeId}/`)
            const anchor2 = await FrontendAnchorGateway.getAnchor(links[0].anchor2Id)
            if (anchor2.success && anchor2.payload) {
              setSelectedAnchors([anchor2.payload])
              setSelectedExtent(anchor2.payload.extent)
            }
          }
        }
        break
    }
  }

  const displaySelectedAnchors = useCallback(() => {
    selectedAnchorIds.forEach((anchorId) => {
      const prevSelectedAnchor = document.getElementById(anchorId)
      if (prevSelectedAnchor) {
        prevSelectedAnchor.style.backgroundColor = ''
      }
    })
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    const newSelectedAnchorIds: string[] = []
    selectedAnchors &&
      selectedAnchors.forEach((anchor) => {
        if (anchor) {
          if (anchor.extent === null && imageContainer.current) {
            imageContainer.current.style.outline = 'solid 5px #d7ecff'
          }
          const anchorElement = document.getElementById(anchor.anchorId)
          if (anchorElement) {
            anchorElement.style.backgroundColor = '#d7ecff'
            anchorElement.style.opacity = '60%'
            newSelectedAnchorIds.push(anchorElement.id)
          }
        }
      })
    setSelectedAnchorIds(newSelectedAnchorIds)
  }, [selectedAnchorIds, selectedAnchors, startAnchor])

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
    displaySelectedAnchors()
  }, [selectedAnchors, refreshLinkList])

  useEffect(() => {
    displayImageAnchors()
  }, [selectedAnchors, currentNode, refreshLinkList, startAnchor])

  useEffect(() => {
    setUpdatedWidth(currentNode.updatedWidth ?? 0)
    setUpdatedHeight(currentNode.updatedHeight ?? 0)
  }, [currentNode])

  /**
   * onPointerDown initializes the creation of a new pin on the map image
   * @param e
   */
  const onPointerDown = (e: React.PointerEvent) => {
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
    xLast = x + 10 - imageLeft!
    yLast = y - 2 - imageTop!
    // Set the initial x and y location of the selection
    if (selection.current) {
      selection.current.style.left = `${xLast}px`
      selection.current.style.top = `${yLast}px`
      setCreatePinPopoverOpen(true)
    }
  }

  /**
   * onPointerMove resizes the selection
   * @param e
   */
  const onPointerMove = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragging) {
      const x = e.clientX // The x location of the pointer in the browser
      const y = e.clientY // The y location of the poitner in the browser
      const deltaX = x - xLast // The change in the x location
      const deltaY = y - yLast // The change in the y location
      xLast = e.clientX
      yLast = e.clientY
      if (selection.current) {
        const imageTop = imageContainer.current?.getBoundingClientRect().top
        const imageLeft = imageContainer.current?.getBoundingClientRect().left
        let left = parseFloat(selection.current.style.left)
        let top = parseFloat(selection.current.style.top)
        let width = parseFloat(selection.current.style.width)
        let height = parseFloat(selection.current.style.height)

        // TODO: You may need to change this depending on your screen resolution
        const divider = 1

        // Horizontal dragging
        // Case A: Dragging above start point
        if (imageLeft && x - imageLeft < currentLeft) {
          width -= deltaX / divider
          left += deltaX / divider
          selection.current.style.left = String(left) + 'px'
          // Case B: Dragging below start point
        } else {
          width += deltaX / divider
        }

        // Vertical dragging
        // Case A: Dragging to the left of start point
        if (imageTop && y - imageTop < currentTop) {
          height -= deltaY / divider
          top += deltaY / divider
          selection.current.style.top = String(top) + 'px'
          // Case B: Dragging to the right of start point
        } else {
          height += deltaY / divider
        }

        // Update height and width
        selection.current.style.width = String(width) + 'px'
        selection.current.style.height = String(height) + 'px'
      }
    }
  }

  /**
   * onPointerUp so we have completed making our selection,
   * therefore we should create a new IImageExtent and
   * update the currently selected extent
   * @param e
   */
  const onPointerUp = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (selection.current) {
      currentTop = 0
      currentLeft = 0
      const extent: IImageExtent = {
        type: 'image',
        height: parseFloat(selection.current.style.height),
        left: parseFloat(selection.current.style.left),
        top: parseFloat(selection.current.style.top),
        width: parseFloat(selection.current.style.width),
      }
      // Check if setSelectedExtent exists, if it does then update it
      if (setSelectedExtent) {
        setSelectedExtent(extent)
      }
    }
  }

  const onHandleClearSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (setSelectedExtent) {
      setSelectedExtent(null)
      if (selection.current) {
        // Note: This is a rather hacky solution to hide the selected region
        selection.current.style.left = '-50px'
        selection.current.style.top = '-50px'
        selection.current.style.width = '0px'
        selection.current.style.height = '0px'
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
  const displayImageAnchors = async (): Promise<void> => {
    let imageAnchors: IAnchor[]
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      const anchorElementList: JSX.Element[] = []
      // List of anchor elements to return
      imageAnchors = anchorsFromNode.payload
      // IAnchor array from FrontendAnchorGateway call
      imageAnchors.forEach((anchor) => {
        // Checking that the extent is of type image to access IImageExtent
        if (anchor.extent?.type == 'image') {
          if (
            !(
              startAnchor &&
              startAnchor.extent?.type == 'image' &&
              startAnchor == anchor &&
              startAnchor.nodeId == currentNode.nodeId
            )
          ) {
            anchorElementList.push(
              <div
                id={anchor.anchorId}
                key={'image.' + anchor.anchorId}
                className="image-anchor"
                onClick={(e) => {
                  handleAnchorSelect(e, anchor)
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  height: anchor.extent.height,
                  left: anchor.extent.left,
                  top: anchor.extent.top,
                  width: anchor.extent.width,
                }}
              />
            )
          }
        }
      })
      if (
        startAnchor &&
        startAnchor.extent?.type == 'image' &&
        startAnchor.nodeId == currentNode.nodeId
      ) {
        anchorElementList.push(
          <div
            id={startAnchor.anchorId}
            key={'image.startAnchor' + startAnchor.anchorId}
            className="image-startAnchor"
            style={{
              height: startAnchor.extent.height,
              left: startAnchor.extent.left,
              top: startAnchor.extent.top,
              width: startAnchor.extent.width,
            }}
          />
        )
      }
      setImageAnchors(anchorElementList)
    }
  }



  return (
    <div className="mapImageWrapper" id="mapImageWrapper">
      <div
        ref={imageContainer}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        className="map-image-content-wrapper"
        id="map-image-content-wrapper"
        style={{ width: updatedWidth, height: updatedHeight }}
      >
        {startAnchorVisualization}
        {imageAnchors}
        {
          <div>

            <Popover
              returnFocusOnClose={false}
              isOpen={createPinPopoverOpen}
              onClose={() => setCreatePinPopoverOpen(false)}
              placement='right'
              closeOnBlur={false}
            >
              <PopoverTrigger>
                <div className="selection" ref={selection}>
                <PlaceIcon/>
              </div>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader fontWeight='semibold'>Create a Pin</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
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
