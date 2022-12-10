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
  RadioGroup,
  Radio,
  Stack,
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
import { Wrapper } from '@googlemaps/react-wrapper'
import { Button } from '../../Button'
import { TreeView } from '../../TreeView'
import './CreateMapModal.scss'
import { createNodeFromModal, uploadImage } from '../CreateNodeModal/createNodeUtils'
import { useSetRecoilState } from 'recoil'
import { selectedNodeState, selectedPinState } from '../../../global/Atoms'
import { IPin } from '../../../types'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'

export interface ICreateMapModalProps {
  isOpen: boolean
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onClose: () => void
  onSubmit: () => unknown
  roots: RecursiveNodeTree[]
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin | null) => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateMapModal = (props: ICreateMapModalProps) => {
  // deconstruct props variables
  const {
    isOpen,
    onClose,
    roots,
    nodeIdsToNodesMap,
    onSubmit,
    selectedPin,
    setSelectedPin,
  } = props

  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('googleMap' as NodeType)
  const [error, setError] = useState<string>('')

  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (nextVal: string) => {
    setSelectedType(nextVal as NodeType)
    console.log(nextVal)
    // setSelectedType('map' as NodeType)
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

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    console.log(selectedType)
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
      type: selectedType as NodeType,
      selectedPin: selectedPin,
    }
    console.log(attributes)
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
                  <Radio key="googleMap" value="googleMap">
                    <div className="radio-option use-google-maps">
                      <img
                        alt="google maps image"
                        src="https://www.adster.ca/wp-content/uploads/2013/04/google-maps.jpg"
                        width="140px"
                        height="60px"
                      ></img>
                    </div>
                  </Radio>
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
