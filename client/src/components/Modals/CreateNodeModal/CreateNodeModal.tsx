import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  RecursiveNodeTree,
} from '../../../types'
import { FrontendPinGateway } from '../../../pins'
import { Button } from '../../Button'
import './CreateNodeModal.scss'
import { createNodeFromModal, uploadImage } from './createNodeUtils'
import { useSetRecoilState, useRecoilState } from 'recoil'
import {
  refreshLinkListState,
  refreshState,
  selectedNodeState,
  selectedPinState,
  refreshPinsState,
  refreshTrailsState,
} from '../../../global/Atoms'
import { IPinProperty, makeIPinProperty } from '../../../types'

export interface ICreateNodeModalProps {
  isOpen: boolean
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onClose: () => void
  onSubmit: () => unknown
  roots: RecursiveNodeTree[]
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateNodeModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, roots, nodeIdsToNodesMap, onSubmit } = props

  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [error, setError] = useState<string>('')
  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value.toLowerCase() as NodeType)
    setContent('')
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleImageContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value)
  }

  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)
  const [refreshPins, setRefreshPins] = useRecoilState(refreshPinsState)
  const [refreshTrails, setRefreshTrails] = useRecoilState(refreshTrailsState)

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    if (!nodeTypes.includes(selectedType)) {
      setError('Error: No type selected')
      return
    }
    if (title.length === 0) {
      setError('Error: No title')
      return
    }
    // get the node id of the map that we're creating the node in
    const mapId = selectedPin?.nodeId

    const attributes = {
      content,
      nodeIdsToNodesMap,
      parentNodeId: mapId ? mapId : null,
      title,
      type: selectedType as NodeType,
      selectedPin: selectedPin,
    }

    const node: INode | null = await createNodeFromModal(attributes)

    const pinChildNodes = selectedPin?.childNodes
    const childNodesCopy = Object.assign([], pinChildNodes)
    if (node !== null && childNodesCopy !== undefined) childNodesCopy.push(node)

    if (node !== null && selectedPin) {
      const pinProperty: IPinProperty = makeIPinProperty('childNodes', childNodesCopy)
      await FrontendPinGateway.updatePin(selectedPin.pinId, [pinProperty])
      node && setSelectedNode(node)
    }

    if (selectedPin) {
      const selectedPinResp = await FrontendPinGateway.getPin(selectedPin.pinId)
      if (selectedPinResp.success && selectedPinResp.payload) {
        setSelectedPin(selectedPinResp.payload)
      }
    }

    setRefreshPins(!refreshPins)
    setRefreshTrails(!refreshTrails)
    onSubmit()
    handleClose()
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
    setTitle('')
    setSelectedParentNode(null)
    setSelectedType('' as NodeType)
    setContent('')
    setError('')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    const link = files && files[0] && (await uploadImage(files[0]))
    link && setContent(link)
  }

  // content prompts for the different node types
  let contentInputPlaceholder: string
  switch (selectedType) {
    case 'text':
      contentInputPlaceholder = 'Text content...'
      break
    case 'image':
      contentInputPlaceholder = 'Image URL...'
      break
    default:
      contentInputPlaceholder = 'Content...'
  }

  const isImage: boolean = selectedType === 'image'
  const isText: boolean = selectedType === 'text'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new node</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input value={title} onChange={handleTitleChange} placeholder="Title..." />
            <div className="modal-input">
              <Select
                value={selectedType}
                onChange={handleSelectedTypeChange}
                placeholder="Select a type"
              >
                {nodeTypes
                  .filter((type) => type !== 'map' && type !== 'googleMap')
                  .map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
              </Select>
            </div>
            {selectedType && isText && (
              <div className="modal-input">
                <Textarea
                  value={content}
                  onChange={handleTextContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isImage && (
              <div className="modal-input">
                <Input
                  value={content}
                  onChange={handleImageContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isImage && (
              <div className="modal-input">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {/* <div className="modal-section">
              <span className="modal-title">
                <div className="modal-title-header">Choose a parent node (optional):</div>
              </span>
              <div className="modal-treeView">
                <TreeView
                  roots={roots}
                  parentNode={selectedParentNode}
                  setParentNode={setSelectedParentNode}
                  changeUrlOnClick={false}
                  selectedPin={selectedPin}
                />
              </div>
            </div> */}
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
