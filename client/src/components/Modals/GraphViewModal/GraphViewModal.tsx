import React, {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import FlowRenderer from './Flow' // Component for the flow
import { Edge } from 'react-flow-renderer'
import { CustomNode } from '../../NodeView'

export interface IGraphViewModalProps {
  isOpen: boolean
  onClose: () => void
  nodes: CustomNode[]
  edges: Edge<any>[]
}

/**
 * Modal for the graph view, which is implemented with react-flow
 */
export const GraphViewModal = (props: IGraphViewModalProps) => {
  const { isOpen, onClose, nodes, edges } = props

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="5xl">
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Graph View</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FlowRenderer nodes={nodes} edges={edges} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
