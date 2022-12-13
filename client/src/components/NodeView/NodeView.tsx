import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FrontendAnchorGateway } from '../../anchors'
import { generateObjectId } from '../../global'
import {
  IAnchor,
  INode,
  IPin,
  isSameExtent,
  NodeIdsToNodesMap,
  NodeType,
  ITrail,
} from '../../types'
import { NodeBreadcrumb } from './NodeBreadcrumb'
import { NodeContent } from './NodeContent'
import { NodeHeader } from './NodeHeader'
import { NodeLinkMenu } from './NodeLinkMenu'
import { PinMenu } from './PinMenu'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  isLinkingState,
  isNavigatingState,
  trailToNavigateState,
  refreshState,
  startAnchorState,
  endAnchorState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
  refreshLinkListState,
  mapPinsState,
  selectedPinState,
  routeDrawerOpenState,
  trailPinsState,
  refreshTrailsState,
  refreshPinsState,
} from '../../global/Atoms'
import './NodeView.scss'
import NodeInfo from '../Modals/GraphViewModal/Flow/NodeInfo'
import { Edge, Node } from 'react-flow-renderer'
import { FrontendLinkGateway } from '../../links'
import { FrontendNodeGateway } from '../../nodes'
import { FrontendPinGateway } from '../../pins'
import { FrontendTrailGateway } from '../../trails'
import { GraphViewModal } from '../Modals'
import { selectParentNode } from '@tiptap/core/dist/packages/core/src/commands'
import { RouteDrawer } from './RouteDrawer'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
} from '@chakra-ui/react'

export interface INodeViewProps {
  currentNode: INode
  // map of nodeIds to nodes
  nodeIdsToNodesMap: NodeIdsToNodesMap
  // handler for completing link
  onCompleteLinkClick: () => void
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void
  // handler for opening create map modal
  onCreateMapButtonClick: () => void
  // handler for deleting currentNode
  onDeleteButtonClick: (node: INode) => void
  // handler for opening move node modal
  onMoveButtonClick: (node: INode) => void
  // children used when rendering folder node
  // onGraphViewClick: (node: INode) => void
  onRouteMenuClick: () => void
  childNodes?: INode[]
  setParentNode: (node: INode) => void
}

// type used for custom node in react flow graph
type NodeInfo = {
  label: string
  flowNodeType: NodeType | undefined
  flowNodeContent: any
  currentNode: INode
}

export type CustomNode = Node<NodeInfo>

// global variables used as intermediates for the nodes and edges of the graph
const myNodes: CustomNode[] = []
const myEdges: Edge[] = []

/** Full page view focused on a node's content, with annotations and links */
export const NodeView = (props: INodeViewProps) => {
  const {
    currentNode,
    nodeIdsToNodesMap,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onCreateMapButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    childNodes,
    setParentNode,
  } = props

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)
  const setIsLinking = useSetRecoilState(isLinkingState)
  const [isNavigating, setIsNavigating] = useRecoilState(isNavigatingState)

  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setEndAnchor = useSetRecoilState(endAnchorState)
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState)
  const selectedExtent = useRecoilValue(selectedExtentState)
  const refresh = useRecoilValue(refreshState)
  const refreshLinkList = useRecoilValue(refreshLinkListState)
  const refreshTrails = useRecoilValue(refreshTrailsState)
  const refreshPins = useRecoilValue(refreshPinsState)
  const [anchors, setAnchors] = useState<IAnchor[]>([])
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)

  const [trailPins, setTrailPins] = useRecoilState(trailPinsState)

  const {
    filePath: { path },
  } = currentNode

  const [pins, setPins] = useRecoilState(mapPinsState)
  const [trails, setTrails] = useState<ITrail[]>([])

  // Define PinIdsToPinsMap
  const [pinIdsToPinsMap, setPinIdsToPinsMap] = useState<{ [pinId: string]: IPin }>({})

  useEffect(() => {
    setCurrentNode(currentNode)
  })

  useEffect(() => {
    setIsNavigating(false)
  }, [currentNode])

  const hasAnchors: boolean = anchors.length > 0
  let hasPins: boolean = pins.length > 0
  let hasTrails: boolean = trails.length > 0

  // New Method
  const loadPinsFromNodeId = useCallback(async () => {
    if (!currentNode) {
      return
    }

    // if this is not a map node, keep traversing up the tree until we find a map node
    let mapNode: INode = currentNode
    while (mapNode && mapNode.type !== 'map') {
      // check if the current node has a parent node
      if (mapNode.filePath.path.length >= 2) {
        const parentId = mapNode.filePath.path[mapNode.filePath.path.length - 2]
        mapNode = nodeIdsToNodesMap[parentId]
      } else {
        break
      }
    }

    if (!mapNode || mapNode.type !== 'map') {
      // console.log('No map node found')
      const pinsFromNode = await FrontendPinGateway.getPinsByNodeId(currentNode.nodeId)
      if (pinsFromNode.success && pinsFromNode.payload) {
        setPins(pinsFromNode.payload)
      }
    } else {
      const pinsFromNode = await FrontendPinGateway.getPinsByNodeId(mapNode.nodeId)
      if (pinsFromNode.success && pinsFromNode.payload) {
        setPins(pinsFromNode.payload)
      }
    }
    hasPins = currentNode.type === 'map' && pins.length > 0
  }, [currentNode])

  const loadTrailsFromNodeId = useCallback(async () => {
    const trailsFromNode = await FrontendTrailGateway.getTrailsByNodeId(
      currentNode.nodeId
    )
    if (trailsFromNode.success && trailsFromNode.payload) {
      setTrails(trailsFromNode.payload)
    }
    hasTrails = trails.length > 0
  }, [currentNode, trailPins])

  // Update the pinIdsToPinsMap
  useEffect(() => {
    const newPinIdsToPinsMap: { [pinId: string]: IPin } = {}
    pins.forEach((pin) => {
      newPinIdsToPinsMap[pin.pinId] = pin
    })
    setPinIdsToPinsMap(newPinIdsToPinsMap)
  }, [currentNode, pins])

  const loadAnchorsFromNodeId = useCallback(async () => {
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      setAnchors(anchorsFromNode.payload)
    }
  }, [currentNode])

  const handleStartLinkClick = () => {
    if (selectedExtent === undefined) {
      setAlertIsOpen(true)
      setAlertTitle('Cannot start link from this anchor')
      setAlertMessage(
        // eslint-disable-next-line
        'There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors.'
      )
    } else {
      const anchor = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
        trailIds: [],
        childNodeIds: [],
      }
      setStartAnchor(anchor)
      setIsLinking(true)
    }
  }

  const handleCompleteLinkClick = async () => {
    const anchorsByNodeResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    let anchor2: IAnchor | undefined = undefined
    if (
      anchorsByNodeResp.success &&
      anchorsByNodeResp.payload &&
      selectedExtent !== undefined
    ) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor2 = nodeAnchor
        }
        if (
          startAnchor &&
          isSameExtent(nodeAnchor.extent, startAnchor.extent) &&
          startAnchor.nodeId == currentNode.nodeId
        ) {
          setStartAnchor(nodeAnchor)
        }
      })
    }
    if (selectedExtent !== undefined) {
      anchor2 = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setEndAnchor(anchor2)
      onCompleteLinkClick()
    }
  }

  useEffect(() => {
    setSelectedAnchors([])
    loadAnchorsFromNodeId()
    loadPinsFromNodeId()
    loadTrailsFromNodeId()
  }, [
    loadAnchorsFromNodeId,
    currentNode,
    refreshLinkList,
    refreshTrails,
    refreshPins,
    setSelectedAnchors,
    loadPinsFromNodeId,
    loadTrailsFromNodeId,
  ])

  const [graphViewModalOpen, setGraphViewModalOpen] = useState(false)

  // State variables for the graph
  const [nodes, setNodes] = useState<CustomNode[]>(myNodes)
  const [edges, setEdges] = useState<Edge[]>(myEdges)

  // Handles graph view
  const handleGraphView = useCallback(
    async (click: boolean) => {
      // Empty myNodes and myEdges arrays
      myNodes.splice(0, myNodes.length)
      myEdges.splice(0, myEdges.length)
      // push the currentNode to myNodes
      myNodes.push({
        id: '1',
        type: 'ni',
        data: {
          label: `${currentNode.title}`,
          flowNodeType: `${currentNode.type}`,
          flowNodeContent: `${currentNode.content}`,
          currentNode: currentNode,
        },
        position: { x: 0, y: -150 },
      })
      // get the anchors for the current node
      const nodeAnchorsResp = await FrontendAnchorGateway.getAnchorsByNodeId(
        currentNode.nodeId
      )
      if (nodeAnchorsResp && nodeAnchorsResp.payload) {
        // array of the anchor ids for the current node
        const nodeAnchorsIds: string[] | undefined = nodeAnchorsResp.payload?.map(
          (element) => element.anchorId
        )
        if (nodeAnchorsIds !== undefined) {
          // get links for each anchor id
          const nodeLinksResp = await FrontendLinkGateway.getLinksByAnchorIds(
            nodeAnchorsIds
          )
          if (nodeLinksResp.success && nodeLinksResp.payload) {
            const nodeLinks = nodeLinksResp.payload
            const n = nodeLinks.length
            // used to position the elements on the graph
            let xPos = 0
            let yPos = 180
            for (let i = 0; i < n; i++) {
              const link = nodeLinks[i]
              // get the opposite anchor
              const anchorNodeId =
                link.anchor1NodeId == currentNode.nodeId
                  ? link.anchor2NodeId
                  : link.anchor1NodeId
              // get the opposite node based on the anchor
              const nodeFromAnchorResp = await FrontendNodeGateway.getNode(anchorNodeId)
              if (nodeFromAnchorResp.success && nodeFromAnchorResp.payload) {
                const flowNode = nodeFromAnchorResp.payload
                // Set x and y position of the react flow node
                if (flowNode && flowNode.title) {
                  // Push the nodes and the edges
                  myNodes.push({
                    id: (i + 2).toString(),
                    type: 'ni',
                    data: {
                      label: `${flowNode.title}`,
                      flowNodeType: `${flowNode.type}`,
                      flowNodeContent: `${flowNode.content}`,
                      currentNode: currentNode,
                    },
                    position: { x: xPos, y: yPos },
                  })
                  // the link titles are used for labels on the links
                  myEdges.push({
                    id: 'e1-' + (i + 2),
                    source: '1',
                    target: (i + 2).toString(),
                    label: `${nodeLinks[i].title}`,
                  })
                  if (i % 2 == 0) {
                    xPos = Math.abs(xPos) + 180
                    yPos -= 25
                  }
                  xPos = Math.abs(xPos) * Math.pow(-1, i)
                }
              }
            }
            setNodes(myNodes)
            setEdges(myEdges)
            // open the modal in click triggered the function
            if (click == true) setGraphViewModalOpen(true)
          }
        }
      }
    },
    [setGraphViewModalOpen, setNodes, setEdges, currentNode, refreshLinkList]
  )

  const [routeDrawerOpen, setRouteDrawerOpen] = useRecoilState(routeDrawerOpenState)

  const hasBreadcrumb: boolean = path.length > 1

  let resizableWidth: number = hasAnchors ? 200 : 0
  if (hasPins) resizableWidth = 400
  const nodeViewWidth: string = `calc(100% - ${resizableWidth}px)`

  const resizablePinMenu = useRef<HTMLHeadingElement>(null)
  const resizableAnchorMenu = useRef<HTMLHeadingElement>(null)
  const divider = useRef<HTMLHeadingElement>(null)

  let xLast: number
  let dragging: boolean = false

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    xLast = e.screenX
    document.removeEventListener('pointermove', onPointerMove)
    document.addEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    let resizable
    if (resizablePinMenu.current) {
      resizable = resizablePinMenu
    }
    if (resizableAnchorMenu.current) {
      resizable = resizableAnchorMenu
    }
    if (divider.current) divider.current.style.width = '10px'
    if (resizable && resizable.current && dragging) {
      const resizableElement = resizable.current
      let width = parseFloat(resizableElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width -= deltaX)
      if (!(newWidth < 245 || newWidth > 420)) {
        resizableElement.style.width = String(width) + 'px'
        // resizableWidth = width
        xLast = e.screenX
      } else {
        // console.log('bye')
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (divider.current) divider.current.style.width = ''
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const handleRouteMenuButtonClick = useCallback(() => {
    setIsNavigating(false)
    setRouteDrawerOpen(true)
  }, [])

  const [trailToNavigate, setTrailToNavigate] = useRecoilState(trailToNavigateState)

  const startNavigation = async (trailId: string) => {
    if (trailId) {
      const getTrailResp = await FrontendTrailGateway.getTrail(trailId)
      if (getTrailResp.success && getTrailResp.payload) {
        const navTrail = getTrailResp.payload
        // console.log(navTrail)
        setTrailToNavigate(navTrail)
      }
    }
  }
  // width: `calc(100% - ${resizableWidth}px)`
  //  width: `calc(100% - ${resizableWidth}px)`
  return (
    <div className="node">
      <div className="nodeView">
        <GraphViewModal
          isOpen={graphViewModalOpen}
          onClose={() => setGraphViewModalOpen(false)}
          nodes={nodes}
          edges={edges}
        />
        <NodeHeader
          onMoveButtonClick={onMoveButtonClick}
          onDeleteButtonClick={onDeleteButtonClick}
          onHandleStartLinkClick={handleStartLinkClick}
          onHandleCompleteLinkClick={handleCompleteLinkClick}
          onGraphViewClick={() => handleGraphView(true)}
          onRouteMenuClick={handleRouteMenuButtonClick}
        />
        <div className="nodeView-scrollable">
          {hasBreadcrumb && (
            <div className="nodeView-breadcrumb">
              <NodeBreadcrumb
                path={path}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
                pinIdsToPinsMap={pinIdsToPinsMap}
              />
            </div>
          )}
          <div
            className={`nodeView-content ${
              currentNode.type === 'map' || currentNode.type == 'googleMap'
                ? 'mapView-content'
                : ''
            }`}
          >
            <NodeContent
              childNodes={childNodes}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
              onCreateMapButtonClick={onCreateMapButtonClick}
              isNavigating={isNavigating}
              trailToNavigate={trailToNavigate}
            />
          </div>
        </div>
      </div>
      {(hasAnchors || hasPins) && (
        <div
          className="divider"
          ref={divider}
          onPointerDown={onPointerDown}
          style={{ width: '5px' }}
        />
      )}
      {(hasAnchors || hasPins) && (
          <>
            {hasAnchors ? (
              <div
                className={'resizable-node-properties'}
                ref={resizableAnchorMenu}
                style={{ width: resizableWidth }}
              >
                <NodeLinkMenu nodeIdsToNodesMap={nodeIdsToNodesMap} />
              </div>
            ) : (
              <div style={{ width: resizableWidth }} ref={resizablePinMenu}>
                <PinMenu
                  setParentNode={setParentNode}
                  onCreateNodeButtonClick={onCreateNodeButtonClick}
                />
              </div>
            )}
          </>
        )}
      {/* {hasAnchors && (
        <div
          className={'resizable-node-properties'}
          ref={resizableAnchorMenu}
          style={{ width: resizableWidth }}
        >
          <NodeLinkMenu nodeIdsToNodesMap={nodeIdsToNodesMap} />
        </div>
      )}
      {currentNode.type === 'map' && hasPins && (
        <div style={{ width: resizableWidth }} ref={resizablePinMenu}>
          <PinMenu
            selectedPin={selectedPin}
            setSelectedPin={setSelectedPin}
            pins={pins}
            setPins={setPins}
            setParentNode={setParentNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
          />
        </div>
      )} */}
      <div>
        <RouteDrawer
          isOpen={routeDrawerOpen}
          onClose={() => setRouteDrawerOpen(false)}
          pins={pins}
          load={handleRouteMenuButtonClick}
          currentNode={currentNode}
          trails={trails}
          setTrails={setTrails}
          setPins={setPins}
          setIsNavigating={setIsNavigating}
          startNavigation={startNavigation}
        />
      </div>
      {/**
       * Add a Pin Menu, with pins for the map, and documents linked to those pins
       */}
    </div>
  )
}
