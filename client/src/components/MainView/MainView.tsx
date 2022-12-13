import { ChakraProvider } from '@chakra-ui/react'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  refreshState,
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  selectedPinState,
  isNavigatingState,
  routeDrawerOpenState,
} from '../../global/Atoms'
import { useLocation } from 'react-router-dom'
import { FrontendNodeGateway } from '../../nodes'
import {
  INode,
  IPin,
  IPinProperty,
  makeIPinProperty,
  NodeIdsToNodesMap,
  RecursiveNodeTree,
} from '../../types'
import { Alert } from '../Alert'
import { ContextMenu } from '../ContextMenu/ContextMenu'
import { Header } from '../Header'
import { LoadingScreen } from '../LoadingScreen'
import {
  CompleteLinkModal,
  CreateNodeModal,
  MoveNodeModal,
  CreateMapModal,
} from '../Modals'
import { NodeView } from '../NodeView'
import { TreeView } from '../TreeView'
import { SearchModal } from '../Modals/SearchModal'
import './MainView.scss'
import { createNodeIdsToNodesMap, emptyNode, makeRootWrapper } from './mainViewUtils'
import { FrontendPinGateway } from '../../pins'

export const MainView = React.memo(function MainView() {
  // app states
  const [isAppLoaded, setIsAppLoaded] = useState(false)

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  // modal states
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false)
  const [createMapModalOpen, setCreateMapModalOpen] = useState(false)
  const [completeLinkModalOpen, setCompleteLinkModalOpen] = useState(false)
  const [moveNodeModalOpen, setMoveNodeModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  // node states
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)
  const [rootNodes, setRootNodes] = useState<RecursiveNodeTree[]>([
    new RecursiveNodeTree(emptyNode),
  ])
  const refresh = useRecoilValue(refreshState)
  // anchor states
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)
  // alerts
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  const [routeDrawerOpen, setRouteDrawerOpen] = useRecoilState(routeDrawerOpenState)
  const [pins, setPins] = useState<IPin[]>([])

  /** update our frontend root nodes and pins from the database */
  const loadRootsFromDB = useCallback(async () => {
    const rootsFromDB = await FrontendNodeGateway.getRoots()
    if (rootsFromDB.success) {
      rootsFromDB.payload && setRootNodes(rootsFromDB.payload)
      if (rootsFromDB.payload) {
        let pinsCollection: IPin[] = []
        // put the root nodes in a local recursive node tree
        const rootNodesTemp = rootsFromDB.payload
        for (let i = 0; i < rootNodesTemp.length; i++) {
          pinsCollection = pinsCollection.concat(
            await getAllPinsFromNodeTree(rootNodesTemp[i])
          )
        }
        setPins(pinsCollection)
      }
      setIsAppLoaded(true)
    }
  }, [])

  // function to get all pins from a given RecursiveNodeTree
  const getAllPinsFromNodeTree = async (nodeTree: RecursiveNodeTree): Promise<IPin[]> => {
    let pinsCollection: IPin[] = []
    // get the pins from the current node
    const pinsFromDB = await FrontendPinGateway.getPinsByNodeId(nodeTree.node.nodeId)
    if (pinsFromDB.success && pinsFromDB.payload) {
      pinsCollection = pinsCollection.concat(pinsFromDB.payload)
    }
    // iterate through each of the children and get their pins
    for (let i = 0; i < nodeTree.children.length; i++) {
      pinsCollection = pinsCollection.concat(
        await getAllPinsFromNodeTree(nodeTree.children[i])
      )
    }
    return pinsCollection
  }

  useEffect(() => {
    loadRootsFromDB()
  }, [loadRootsFromDB, refresh])

  const rootRecursiveNodeTree: RecursiveNodeTree = useMemo(
    () => makeRootWrapper(rootNodes),
    [rootNodes]
  )

  // map each nodeId to its full node object for easy access
  const nodeIdsToNodesMap: NodeIdsToNodesMap = useMemo(
    () => createNodeIdsToNodesMap(rootNodes),
    [rootNodes]
  )

  // node routing	logic
  const url = useLocation().pathname.slice(0, -1)
  const lastUrlParam = url.substring(url.lastIndexOf('/') + 1)

  useEffect(() => {
    const currentNodeId = lastUrlParam
    async function fetchNodeFromUrl() {
      const fetchResp = await FrontendNodeGateway.getNode(currentNodeId)
      if (fetchResp.success) {
        setSelectedNode(fetchResp.payload)
      }
    }
    fetchNodeFromUrl()
  }, [lastUrlParam])

  const globalKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setSelectedAnchors([])
        setSelectedExtent(null)
    }
  }

  // Trigger on app load
  useEffect(() => {
    document.addEventListener('keydown', globalKeyHandlers)
  }, [])

  // button handlers
  const handleCreateNodeButtonClick = useCallback(() => {
    setCreateNodeModalOpen(true)
  }, [setCreateNodeModalOpen])

  const handleCreateMapButtonClick = useCallback(() => {
    setCreateMapModalOpen(true)
  }, [])

  const handleRouteMenuButtonClick = useCallback(() => {
    setRouteDrawerOpen(true)
  }, [])

  const handleMoveNodeButtonClick = useCallback(() => {
    setMoveNodeModalOpen(true)
  }, [])

  const handleDeleteNodeButtonClick = useCallback(
    async (node: INode) => {
      if (node) {
        const deleteResp = await FrontendNodeGateway.deleteNode(node.nodeId)
        if (!deleteResp.success) {
          setAlertIsOpen(true)
          setAlertTitle('Delete node failed')
          setAlertMessage('Delete node failed in MainView.tsx')
          return
        }
        const path: string[] = node.filePath.path
        if (path.length > 1) {
          const parentId: string = path[path.length - 2]
          const parentResp = await FrontendNodeGateway.getNode(parentId)
          if (parentResp.success) {
            setSelectedNode(parentResp.payload)
            // Get the map that contains this node (first node in the path)
            const mapId: string = path[0]
            const mapResp = await FrontendNodeGateway.getNode(mapId)
            if (mapResp.success) {
              // get all of the pins on this map
              const pinsResp = await FrontendPinGateway.getPinsByNodeId(mapId)
              if (pinsResp.success && pinsResp.payload) {
                console.log('pinsResp.payload:', pinsResp.payload)
                for (let i = 0; i < pinsResp.payload.length; i++) {
                  const pin = pinsResp.payload[i]
                  const childNodes = pin.childNodes
                  // find the index of the node that has the same id as the deleted node
                  const index = childNodes.findIndex(
                    (childNode) => childNode.nodeId === node.nodeId
                  )
                  if (index > -1) {
                    console.log('found node in pin:', pin)
                    console.log('original childNodes:', childNodes)
                    const newProperty: IPinProperty = makeIPinProperty(
                      'childNodes',
                      childNodes.filter((_, i) => i !== index)
                    )
                    console.log('new childNodes:', newProperty.value)
                    const updateResp = await FrontendPinGateway.updatePin(pin.pinId, [
                      newProperty,
                    ])
                    if (!updateResp.success) {
                      setAlertIsOpen(true)
                      setAlertTitle('Delete node failed')
                      setAlertMessage('Delete node failed in MainView.tsx:97')
                      return
                    }
                  }
                }
              }
            }
            return
          }
        }
        setSelectedNode(null)
        loadRootsFromDB()
      }
    },
    [loadRootsFromDB]
  )

  const handleCompleteLinkClick = useCallback(() => {
    setCompleteLinkModalOpen(true)
  }, [])

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const getSelectedNodeChildren = useCallback(() => {
    if (!selectedNode) return undefined
    return selectedNode.filePath.children.map(
      (childNodeId) => nodeIdsToNodesMap[childNodeId]
    )
  }, [nodeIdsToNodesMap, selectedNode])

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

    if (treeView.current && dragging) {
      const treeViewElement = treeView.current
      let width = parseFloat(treeViewElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width += deltaX)
      if (!(newWidth < 100 || newWidth > 480)) {
        treeViewElement.style.width = String(width) + 'px'
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const treeView = useRef<HTMLHeadingElement>(null)

  const isNavigating = useRecoilValue(isNavigatingState)

  return (
    <ChakraProvider>
      {!isAppLoaded ? (
        <LoadingScreen hasTimeout={true} />
      ) : (
        <div className="main-container">
          <Alert></Alert>
          <Header
            onHomeClick={handleHomeClick}
            onCreateNodeButtonClick={handleCreateNodeButtonClick}
            onCreateMapButtonClick={handleCreateMapButtonClick}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            setSearchModalOpen={setSearchModalOpen}
          />
          <CreateNodeModal
            isOpen={createNodeModalOpen}
            onClose={() => setCreateNodeModalOpen(false)}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={loadRootsFromDB}
          />
          <CreateMapModal
            isOpen={createMapModalOpen}
            onClose={() => setCreateMapModalOpen(false)}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={loadRootsFromDB}
          />
          <CompleteLinkModal
            isOpen={completeLinkModalOpen}
            onClose={() => setCompleteLinkModalOpen(false)}
            nodeIdsToNodes={nodeIdsToNodesMap}
          />
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            setParentNode={setSelectedNode}
            setSearchModalOpen={setSearchModalOpen}
          />
          {selectedNode && (
            <div>
              <MoveNodeModal
                isOpen={moveNodeModalOpen}
                onClose={() => setMoveNodeModalOpen(false)}
                onSubmit={loadRootsFromDB}
                node={selectedNode}
                roots={rootNodes}
              />
            </div>
          )}
          <div className="content">
            <div className="treeView-container" ref={treeView} style={{ width: 280 }}>
              <div className="search-container"></div>
              <TreeView
                roots={rootNodes}
                parentNode={selectedNode}
                setParentNode={setSelectedNode}
                selectedPin={selectedPin}
                pins={pins}
              />
            </div>
            <div className="divider" onPointerDown={onPointerDown} />
            <div className="node-wrapper">
              <NodeView
                childNodes={
                  selectedNode
                    ? getSelectedNodeChildren()
                    : rootNodes.map((root) => root.node)
                }
                currentNode={selectedNode ? selectedNode : rootRecursiveNodeTree.node}
                onDeleteButtonClick={handleDeleteNodeButtonClick}
                onMoveButtonClick={handleMoveNodeButtonClick}
                onCompleteLinkClick={handleCompleteLinkClick}
                onCreateNodeButtonClick={handleCreateNodeButtonClick}
                onCreateMapButtonClick={handleCreateMapButtonClick}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
                setParentNode={setSelectedNode}
                onRouteMenuClick={handleRouteMenuButtonClick}
              />
            </div>
          </div>
        </div>
      )}
      <ContextMenu />
    </ChakraProvider>
  )
})
