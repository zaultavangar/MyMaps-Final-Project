import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  RecursiveNodeTree,
} from '../../../types'
import { Button } from '../../Button'
import { TreeView } from '../../TreeView'
import './CreateMapModal.scss'
import { createNodeFromModal, uploadImage } from '../CreateNodeModal/createNodeUtils'
import { useSetRecoilState, useRecoilState } from 'recoil'
import { selectedNodeState, selectedPinState } from '../../../global/Atoms'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'

export interface ICreateMapModalProps {
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
export const CreateMapModal = (props: ICreateMapModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, roots, nodeIdsToNodesMap, onSubmit } = props

  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('googleMap' as NodeType)
  const [error, setError] = useState<string>('')
  const [selectedPin] = useRecoilState(selectedPinState)

  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (nextVal: string) => {
    setSelectedType(nextVal as NodeType)
    // setSelectedType('map' as NodeType)
    setContent('')
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleImageContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value)
  }

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
    const attributes = {
      content,
      nodeIdsToNodesMap,
      parentNodeId: selectedParentNode ? selectedParentNode.nodeId : null,
      title,
      type: 'map' as NodeType,
      selectedPin: selectedPin,
    }
    const node = await createNodeFromModal(attributes)
    node && setSelectedNode(node)
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
    case 'map':
      contentInputPlaceholder = 'Image URL...'
      break
    default:
      contentInputPlaceholder = ''
      break
  }

  const isImage: boolean = selectedType === 'map'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new map</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Map Title..."
            />
            <div className="modal-input">
              <RadioGroup
                onChange={(nextVal) => handleSelectedTypeChange(nextVal)}
                value={selectedType}
              >
                <Stack direction="column">
                  <Radio key="map" value="map">
                    <div className="radio-option upload-image">
                      <FileUploadRoundedIcon fontSize="large" />
                      <div>Upload an Image</div>
                    </div>
                  </Radio>
                </Stack>
              </RadioGroup>
              {/* <Select
                value={selectedType}
                onChange={handleSelectedTypeChange}
                placeholder="Upload an image or use Google Maps"
              >
                <option key="map" value="map">
                  Use Google Maps
                </option>
                <option key="image" value="image">
                  Upload an Image
                </option>
              </Select> */}
            </div>
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
            {/* {selectedType && isMap && <div>Option to Type In Location</div>} */}
            <div className="modal-section">
              <span className="modal-title">
                <div className="modal-title-header">Choose a parent map (optional):</div>
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
            </div>
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
