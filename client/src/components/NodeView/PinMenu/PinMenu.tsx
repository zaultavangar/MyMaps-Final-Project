import './PinMenu.scss'
import { FrontendPinGateway } from '../../../pins'
import { IPin, INode, NodeIdsToNodesMap, RecursiveNodeTree } from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,

} from '@chakra-ui/react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
import { pathToString, nodeTypeIcon } from '../../../global'
import { CreateNodeModal } from '../../Modals'
import * as ai from 'react-icons/ai'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface IPinMenuProps {
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin | null) => void
  pins: IPin[]
  setPins: (pins: IPin[]) => void
  setParentNode: (node: INode) => void
  onCreateNodeButtonClick: () => void

}


export const PinMenu = (props: IPinMenuProps) => { 
  const {selectedPin, setSelectedPin, pins, setPins, setParentNode, 
   onCreateNodeButtonClick} = props

  const icon = nodeTypeIcon('map') // icon based on type

  // Formats a date, could be global method ***
  const formatDate = (date: any) => {
    const dateCreated = new Date(date)
    return dateCreated.toLocaleDateString('en-us')
  }

  const handleLinkClick = (node: INode) => {
      setParentNode(node)
  }

  const customButtonStyle = { height: 30, marginLeft: 10, width: 150}

  return (
    <div className='pin-menu-container'>
      {selectedPin === null ? 
        <div>
          <h2 className="your-pins">Your Pins</h2>
          <List>
            {pins.map(pin => 
              <ListItem>
                <div className="pin-menu-item-wrapper" onClick={() => setSelectedPin(pin)}>
                <ListIcon as={PlaceIcon} color={selectedPin == pin ? 'blue' : "primary"} />
                  {pin.title}
                  <p className="pin-explainer">{pin.explainer}</p>
                </div>
              </ListItem>
            )}
          </List>
        </div>
        :
        <div>
           <Button
              onClick={()=> setSelectedPin(null)}
              icon={<ai.AiOutlineArrowLeft/>}
              text="Show all pins"
              style={{backgroundColor: "white", marginBottom: "10px"}}
            />
          <h2 className="pin-title pin-selected">{selectedPin.title}</h2>
          <p className="pin-explainer pin-selected">{selectedPin.explainer}</p>
          <h4 className="pin-documents">Pin Documents</h4>
            {selectedPin.childNodes.map(node => {
              <div className={'item-wrapper'} onClick={() => handleLinkClick(node)}>
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
            })}
            <div className="create-node-button-wrapper">
              <Button
                text="Create Node"
                style={customButtonStyle}
                icon={<ai.AiOutlinePlus />}
                onClick={onCreateNodeButtonClick}
              />
            </div>


        </div>
      }
    </div>
  )
}