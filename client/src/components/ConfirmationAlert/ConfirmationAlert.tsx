import React, { useRef } from 'react'
import { IPin, ITrail } from '../../types'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'

interface IConfirmationAlertProps {
  isOpen: boolean
  setOpen: (b: boolean) => void
  confirmationType: string
  specificTrail?: ITrail | null
  pinToDelete: IPin | null
  handleRemovePinFromTrail?: (pin: IPin) => void
  onDeleteTrailButtonClick?: () => void
  onDeletePinButtonClick?: () => void
}

export const ConfirmationAlert = (props: IConfirmationAlertProps) => {
  const {
    isOpen,
    setOpen,
    confirmationType,
    specificTrail,
    pinToDelete,
    handleRemovePinFromTrail,
    onDeleteTrailButtonClick,
    onDeletePinButtonClick,
  } = props

  const cancelConfirmationRef = React.useRef(null)

  const handleDeletePinButtonClick = () => {
    setOpen(false)
    if (onDeletePinButtonClick) onDeletePinButtonClick()
  }
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelConfirmationRef}
      onClose={() => setOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {confirmationType === 'deletePinFromTrail' && <>Delete Pin from Route</>}
            {confirmationType === 'deleteTrail' && <>Delete Route</>}
            {confirmationType === 'deletePin' && <>Delete Pin</>}
          </AlertDialogHeader>
          <AlertDialogBody>
            <>
              {specificTrail ? (
                <>
                  {confirmationType === 'deletePinFromTrail' && (
                    <>
                      Are you sure you want to delete <b>{pinToDelete!.title}</b> from{' '}
                      <b style={{ color: 'green' }}>{specificTrail.title}</b>?
                    </>
                  )}
                  {confirmationType === 'deleteTrail' && (
                    <>
                      Are you sure you want to delete{' '}
                      <b style={{ color: 'green' }}>{specificTrail!.title}</b>
                    </>
                  )}
                </>
              ) : (
                <>
                  {confirmationType === 'deletePin' && pinToDelete && (
                    <>
                      Are you sure you want to delete{' '}
                      <b style={{ color: 'green' }}>{pinToDelete!.title}</b>? Deleting
                      this pin will delete ALL of its child nodes as well!
                    </>
                  )}
                </>
              )}
            </>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <div>
              {confirmationType === 'deletePinFromTrail' && handleRemovePinFromTrail && (
                <Button
                  ref={cancelConfirmationRef}
                  colorScheme="red"
                  onClick={() => handleRemovePinFromTrail(pinToDelete!)}
                  ml={3}
                >
                  Delete
                </Button>
              )}
              {confirmationType === 'deleteTrail' && (
                <Button
                  ref={cancelConfirmationRef}
                  colorScheme="red"
                  onClick={onDeleteTrailButtonClick}
                  ml={3}
                >
                  Delete
                </Button>
              )}
              {confirmationType === 'deletePin' && (
                <Button
                  ref={cancelConfirmationRef}
                  colorScheme="red"
                  onClick={handleDeletePinButtonClick}
                  ml={3}
                >
                  Delete
                </Button>
              )}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
