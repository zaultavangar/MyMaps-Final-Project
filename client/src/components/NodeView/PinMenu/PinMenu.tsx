import React, { useState } from 'react'
import './PinMenu.scss'
import { FrontendPinGateway } from '../../../pins'
import { IPin, INode, NodeIdsToNodesMap, RecursiveNodeTree } from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from '@chakra-ui/react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
import { pathToString, nodeTypeIcon } from '../../../global'
import { CreateNodeModal } from '../../Modals'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'


interface IPinMenuProps {
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin | null) => void
  pins: IPin[]
  setPins: (pins: IPin[]) => void
  setParentNode: (node: INode) => void
  onCreateNodeButtonClick: () => void
}

export const PinMenu = (props: IPinMenuProps) => {
  const {
    selectedPin,
    setSelectedPin,
    pins,
    setPins,
    setParentNode,
    onCreateNodeButtonClick,
  } = props

  const icon = nodeTypeIcon('map') // icon based on type

  // Formats a date, could be global method ***
  const formatDate = (date: any) => {
    const dateCreated = new Date(date)
    return dateCreated.toLocaleDateString('en-us')
  }

  const handleLinkClick = (node: INode) => {
    setParentNode(node)
  }

  const customButtonStyle = { height: 40, width: 150, fontSize: "16px", backgroundColor: "lightblue", paddingTop: "10px", paddingBottom: "10px" }

  if (selectedPin) {
    selectedPin.childNodes.map(node => {
      console.log(node.title)
    })
  }
  else {
    console.log("nbooo")
  }


  return (
    <div className="pin-menu-container">
      {selectedPin === null ? (
        <div>
          <h2 className="your-pins">Your Pins</h2>
          <List>
            {pins.map((pin) => (
              <ListItem key={pin.pinId}>
                <div
                  className="pin-menu-item-wrapper"
                  onClick={() => setSelectedPin(pin)}
                >
                  <ListIcon
                    as={PlaceIcon}
                    color={selectedPin == pin ? 'blue' : 'primary'}
                  />
                  {pin.title}
                  <p className="pin-explainer">{pin.explainer}</p>
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      ) : (
        <div>
          <Button
            onClick={() => setSelectedPin(null)}
            icon={<ai.AiOutlineArrowLeft />}
            text="Show all pins"
            style={{ backgroundColor: 'white', fontSize:"14px"}}
          />
          <hr style={{marginBottom: "10px"}}></hr>
          <h2 className="pin-title pin-selected">{selectedPin.title}</h2>
          <p className="pin-explainer pin-selected">{selectedPin.explainer}</p>
          <h4 className="pin-documents">Pin Documents</h4>
          <List>
          {selectedPin && selectedPin.childNodes.map((node) => 
            <div className={'pin-documents-item-wrapper'} onClick={() => handleLinkClick(node)}>
              <Link to={pathToString(node.filePath)}>
                <ListItem>
                  <div className="icon-date-wrapper">
                    <div className="search-list-icon">{icon}</div>
                    <div className="date-created">{formatDate(node.dateCreated)}</div>
                  </div>
                  {node.title}
                </ListItem>
              </Link>
            </div>
          )}
          </List>
          <div className="create-node-button-wrapper">
            <Button
              text="Create Node"
              style={customButtonStyle}
              icon={<ai.AiOutlineFileAdd />}
              onClick={onCreateNodeButtonClick}
            />
          </div>
          <div className="add-to-trail-button-wrapper">
          <Button
              text="Add to Trail"
              style={customButtonStyle}
              icon={<ri.RiRouteLine />}
              onClick={onCreateNodeButtonClick}
            />
          </div>
        </div>
      )}
    </div>
  )
}
