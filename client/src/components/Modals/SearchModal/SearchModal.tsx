import { Input, list, Text } from '@chakra-ui/react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  List,
  ListItem,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio, 
  Stack
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useCallback } from 'react'
import { FrontendNodeGateway } from '../../../nodes'
import { FrontendPinGateway } from '../../../pins'
import './SearchModal.scss'
import { INode } from '../../../types'
import { pathToString, nodeTypeIcon } from '../../../global'
import { sameValueZeroEqual } from 'fast-equals'
import { RiContactsBookLine } from 'react-icons/ri'

export interface ISearchModalProps {
  isOpen: boolean
  onClose: () => void
  setParentNode: (node: INode) => void
  setSearchModalOpen: (value: boolean) => void
}

/**
 * Modal for search. The main elements are a search bar for input and a sidebar
 * with filter options.
 *
 */
export const SearchModal = (props: ISearchModalProps) => {
  const { isOpen, onClose, setParentNode, setSearchModalOpen } = props
  const [searchValue, setSearchValue] = useState('') // value of the search input
  const [searchResults, setSearchResults] = useState<{[searchType: string]: string[] | null}>({}) // search results

  const [dateFilter, setDateFilter] = useState(false) // dateFilter status
  // list of chosen types
  const [typeFilter, setTypeFilter] = useState<string[]>(['text', 'image', 'folder', 'map'])

  // Handles change in the input bar
  const handleSearch = (event: any) => {
    setSearchValue(event.target.value) // update searchValue
  }

    const [checkedItems, setCheckedItems] = useState([true, true, true])
    const allChecked = checkedItems.every(Boolean)
    const isIndeterminate = checkedItems.some(Boolean) && !allChecked

    const [typeChanged, setTypeChanged] = useState<number | null>(null)

    const [mapFilterChecked, setMapFilterChecked] = useState<boolean>(true)
    const [pinFilterChecked, setPinFilterChecked] = useState<boolean>(true)


  // Send the search through FrontendNodeGateway
  const sendSearch = async () => {
    console.log('HIHIHI')
    console.log(typeFilter)
    let responseArr : {[searchType: string]: string[] | null} = {}
    setTypeChanged(null)
    const searchResponse = await FrontendNodeGateway.search(
      searchValue,
      typeFilter,
      dateFilter
    )
    if (searchResponse.success) {
      responseArr['nodeSearch'] = searchResponse?.payload
      // return searchResponse?.payload
    }
    if (pinFilterChecked) {
      const pinSearchResponse = await FrontendPinGateway.search(
        searchValue,
      )
      if (pinSearchResponse.success) {
        responseArr['pinSearch'] = pinSearchResponse?.payload
        console.log(pinSearchResponse?.payload)
        // return pinSearchResponse?.payload
      } 
    }
    return responseArr
  }

  // Update search results on input and filter change
  useEffect(() => {
    sendSearch().then((result) => {
      if (result !== null && result !== undefined) {
        setSearchResults(result) // update search results
      }
    })
  }, [searchValue, typeFilter, dateFilter, pinFilterChecked, ])


  // Handles selecting/deselecting the sort by date created filter
  const handleDateFilterChange = () => {
    setDateFilter(!dateFilter)
  }

  // Handles closing the modal
  const handleClose = () => {
    setDateFilter(false)
    setSearchResults({})
    setSearchValue('')
    onClose()
  }

  // Gets a node by its node id
  const getNodeForClick = async (element: any = {}) => {
    const nodeResp = await FrontendNodeGateway.getNode(element['nodeId'])
    let node: INode
    if (nodeResp.success && nodeResp.payload) {
      node = nodeResp.payload
      return node
    }
    return null
  }

  // Handles clicking on one of the search results
  const handleSearchLinkClick = async (element: any = {}) => {
    const node = await getNodeForClick(element)
    if (node !== null) {
      setParentNode(node)
      setSearchModalOpen(false)
    }
  }

  /*
  Gets the path for a search result. Used for the Link component in getSearchLinks
   */
  const getPath = async (element: any = {}) => {
    const node = await getNodeForClick(element)
    if (node !== null) {
      return pathToString(node.filePath)
    }
  }

  // Formats a date
  const formatDate = (date: any) => {
    const dateCreated = new Date(date)
    return dateCreated.toLocaleDateString('en-us')
  }

  /*
   * Function that returns a search result and all its relevant information. This
   * information is wrapped in a Link to handle re-routing when a search result is
   * clicked.
   *
   * */
  const getSearchLinks = (element: any) => {
    const icon = nodeTypeIcon(element['type']) // icon based on type
    return (
      <div className={'item-wrapper'} onClick={() => handleSearchLinkClick(element)}>
        <Link to={getPath(element)}>
          <ListItem>
            <div className="icon-date-wrapper">
              <div className="search-list-icon">{icon}</div>
              <div className="date-created">{formatDate(element['dateCreated'])}</div>
            </div>
            {element['title']}
          </ListItem>
        </Link>
      </div>
    )
  }


  const checkIfInList = (val: string) => {
    const typeFilterCpy = typeFilter.slice() 
    console.log(typeFilterCpy)
    if (!typeFilterCpy.includes(val)) {
      typeFilterCpy.push(val)
    } else {
      typeFilterCpy.splice(typeFilter.indexOf(val), 1)
    }
    console.log(typeFilterCpy)
    setTypeFilter(typeFilterCpy) // update the type filter array
  }



  const onMapFilterChange = (e: any) => {
    setMapFilterChecked(e.target.checked)
    checkIfInList('map')
  }

  const onPinFilterChange = (e: any) => {
    setPinFilterChecked(!pinFilterChecked)
  }


  const onSubFilterChange = (e: any, index: number) => {
    let val = e.target.checked ? true : false
    setTypeChanged(index)
    switch (index) {     
      case 0:
        setCheckedItems([val, checkedItems[1], checkedItems[2]])  
        break;
      case 1:
        setCheckedItems([checkedItems[0], val, checkedItems[2]])     
        break;
      case 2:
        setCheckedItems([checkedItems[0], checkedItems[1], val])     
        break;
        break;  
      default: 
        break;
    }
    handleTypeFilter(index)
  }

  const onDocumentFilterChange = (e: any) => {
    let val = e.target.checked
     setCheckedItems([val, val, val, val])
     handleTypeFilter(null)
  }

  const handleTypeFilter = (index: number | null) => {
      if (index === null) {   
          const list: string[] = ['text', 'image', 'folder'] 
          var typeFilterCpy = typeFilter.slice() 
          for (let i=0; i<list.length; i++) {
            if (!typeFilterCpy.includes(list[i])) {
              typeFilterCpy.push(list[i])
            } else {
              typeFilterCpy.splice(typeFilterCpy.indexOf(list[i]), 1)
            }
          }
          setTypeFilter(typeFilterCpy) // update the type filter array
        
      }
      else {
        let type 
        switch (index) {
          case 0:
            type = 'text'
            break       
          case 1:
            type = 'image'
            break
          case 2:
            type = 'folder'
            break
          default:
            break        
        }
        if (type) {
          checkIfInList(type)
        }
      }
      
  }
  

  return (
    <div>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="modal-font">
          <ModalOverlay />
          <ModalContent maxW="500px" className="modal-content">
            <ModalHeader className="modal-header">
              <Input
                style={{ width: '70%' }}
                onChange={handleSearch}
                display="inline-flex"
                placeholder="Search"
                id="search-input"
                autoComplete="off"
              />
            </ModalHeader>

            <ModalBody className="modal-body">
              <div className="documents">
                <Text mb="15px">Documents found({searchResults.length}):</Text>
                <List spacing={3}>
                  {searchResults['pinSearch']?.map((element: any) => getSearchLinks(element))}
                  {searchResults['nodeSearch']?.map((element: any) => getSearchLinks(element))}
                </List>
              </div>
              <div className="filter-menu">
                <div className="date">
                  <div className="filter-cat">Sort by:</div>
                  <Stack>
                    <Checkbox value="dateCreated" onChange={handleDateFilterChange}>
                      <span className="checkbox">Date Created</span>
                    </Checkbox>
                  </Stack>
                </div>
                <div className="type">
                  <div className="filter-cat">Type:</div>
                  <Stack direction='column'>
                  <Checkbox
                    isChecked={mapFilterChecked}
                    onChange={(e) => onMapFilterChange(e)}
                  >
                    <span className="checkbox">Map</span>
                  </Checkbox>
                  <Checkbox 
                    isChecked={pinFilterChecked}
                    onChange={(e) => onPinFilterChange(e)}
                    defaultChecked
                    >
                    <span className="checkbox">Pin</span>
                  </Checkbox>
                  <Checkbox
                    isChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={(e) => onDocumentFilterChange(e)}
                  >
                      <span className="checkbox">Document</span>
                  </Checkbox>
                  <Stack pl={6} mt={1} spacing={1}>
                    <Checkbox
                      isChecked={checkedItems[0]}
                      onChange={(e) => onSubFilterChange(e, 0)}
                    >
                    <span className="checkbox">Text</span>
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[1]}
                      onChange={(e) => onSubFilterChange(e, 1)}
                    >
                      <span className="checkbox">Image</span>
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[2]}
                      onChange={(e) => onSubFilterChange(e, 2)}
                    >
                      <span className="checkbox">Folder</span>
                    </Checkbox>
                  </Stack>
                  </Stack>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div>
                <ModalCloseButton />
              </div>
            </ModalFooter>
          </ModalContent>
        </div>
      </Modal>
    </div>
  )
}
