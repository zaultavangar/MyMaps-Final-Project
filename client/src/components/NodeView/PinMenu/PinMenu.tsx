import './PinMenu.scss'
import { FrontendPinGateway } from '../../../pins'
import { IPin, INode } from '../../../types'
import PlaceIcon from '@mui/icons-material/Place'
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,

} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { pathToString, nodeTypeIcon } from '../../../global'

interface IPinMenuProps {
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin | null) => void
  pins: IPin[]
  setPins: (pins: IPin[]) => void
  setParentNode: (node: INode) => void

}

 

export const PinMenu = (props: IPinMenuProps) => { 
  const {selectedPin, setSelectedPin, pins, setPins, setParentNode} = props

  const icon = nodeTypeIcon('map') // icon based on type

  // Formats a date, could be global method ***
  const formatDate = (date: any) => {
    const dateCreated = new Date(date)
    return dateCreated.toLocaleDateString('en-us')
  }

  const handleLinkClick = (node: INode) => {
      setParentNode(node)
  }

  return (
    <div>
      {selectedPin === null ? 
        <div>
          <UnorderedList>
            {pins.map(pin => {
              <ListItem>
                <ListIcon as={PlaceIcon} color='green.500' />
                  <p className="pin-title">{pin.title}</p>
                  <p className="pin-explainer">{pin.explainer}</p>
              </ListItem>
            })}
          </UnorderedList>
        </div>
        :
        <div>
          <h2 className="pin-title pin-selected">{selectedPin.title}</h2>
          <p className="pin-explainer pin-selected">{selectedPin.explainer}</p>
          <h4>Pin Documents</h4>
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
          

        </div>
      }
    </div>
  )
}