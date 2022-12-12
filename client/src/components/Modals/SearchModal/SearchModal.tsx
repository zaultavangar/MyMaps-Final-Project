import { Input, Text } from '@chakra-ui/react'
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
import React, { useState, useEffect } from 'react'
import { FrontendNodeGateway } from '../../../nodes'
import { FrontendPinGateway } from '../../../pins'
import './SearchModal.scss'
import { INode } from '../../../types'
import { pathToString, nodeTypeIcon } from '../../../global'

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
  const [searchResults, setSearchResults] = useState<string[]>([]) // search results

  const [dateFilter, setDateFilter] = useState(false) // dateFilter status
  // list of chosen types
  const [typeFilter, setTypeFilter] = useState<string[]>([])

  // Handles change in the input bar
  const handleSearch = (event: any) => {
    setSearchValue(event.target.value) // update searchValue
  }

  // Send the search through FrontendNodeGateway
  const sendSearch = async () => {
    const searchResponse = await FrontendNodeGateway.search(
      searchValue,
      typeFilter,
      dateFilter
    )
    if (searchResponse.success) {
      return searchResponse?.payload
    }
    const pinSearchResponse = await FrontendPinGateway.search(
      searchValue,
      typeFilter,
    )
    if (pinSearchResponse.success) {
      return pinSearchResponse?.payload
    } 
  }

  // Update search results on input and filter change
  useEffect(() => {
    sendSearch().then((result) => {
      if (result !== null && result !== undefined) {
        setSearchResults(result) // update search results
      }
    })
  }, [searchValue, typeFilter, dateFilter])

  // Handles selecting/deselecting the sort by date created filter
  const handleDateFilterChange = () => {
    setDateFilter(!dateFilter)
  }

  // Handles selecting/deselecting of the type filters
  const handleTypeFilterChange = (event: any) => {
    const newTypeFilter = typeFilter.slice() // copy of types array
    // push type if not yet selected, remove it if already selected
    if (!newTypeFilter.includes(event.target.value)) {
      newTypeFilter.push(event.target.value)
    } else {
      newTypeFilter.splice(typeFilter.indexOf(event.target.value), 1)
    }
    setTypeFilter(newTypeFilter) // update the type filter array
  }

  // Handles closing the modal
  const handleClose = () => {
    setDateFilter(false)
    setSearchResults([])
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

  const [checkedItems, setCheckedItems] = useState<string[]>(['', '', ''])
  const allChecked = checkedItems.every(el => el.length>0)
  const isIndeterminate= checkedItems.some(el => el.length>0) && !allChecked
  const [radioValue, getRadioValue] = useState('')

  useEffect(() => {
      let checked = checkedItems

      const newTypeFilter = typeFilter.slice() 
      checked.map((type => {
        if (!newTypeFilter.includes(type)) {
          newTypeFilter.push(type)
        } else {
          newTypeFilter.splice(typeFilter.indexOf(type), 1)
        }
      })) 
      setTypeFilter(newTypeFilter) // update the type filter array
  }, [checkedItems])

  const onSubFilterChange = (e: any, index: number) => {
    let val 
    let checkedList
    switch (index) {
      case 0:
        val = e.target.checked ? 'text' : ''
        checkedList = [val, checkedItems[1], checkedItems[2]]
        break;
      case 1:
        val = e.target.checked ? 'image' : ''
        checkedList = [checkedItems[0], val, checkedItems[2]]
        break;
      case 2:
        val = e.target.checked ? 'folder' : ''
        checkedList = [checkedItems[0], checkedItems[1], val]
        break;
      default: 
        break;
    }
    if (checkedList) setCheckedItems(checkedList)
  }

  const onDocumentFilterChange = (e: any) => {
    let val: boolean = e.target.checked
    if (val) setCheckedItems(['text', 'image', 'folder'])
    else setCheckedItems( ['','',''])
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
                  {searchResults?.map((element: any) => getSearchLinks(element))}
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
                  <CheckboxGroup colorScheme="green" defaultValue={[]}>
                    <Stack direction='column'>
                      <Checkbox><span className="checkbox">Map</span></Checkbox>
                      <Checkbox ><span className="checkbox">Pin</span></Checkbox>
                      <Checkbox 
                        value='document'
                        isChecked={allChecked}
                        isIndeterminate={isIndeterminate}
                        onChange={(e) => onDocumentFilterChange(e)}
                          >
                        <span className="checkbox">Document</span>
                      </Checkbox>
                      <Stack pl={6} mt={1} spacing={1}>
                        <Checkbox
                          isChecked={checkedItems[0].length>0}
                          onChange={(e) => onSubFilterChange(e, 0)}
                        >
                           <span className="checkbox">Text</span>
                        </Checkbox>
                        <Checkbox
                          isChecked={checkedItems[1].length>0}
                          onChange={(e) => onSubFilterChange(e, 1)}
                        >
                           <span className="checkbox">Image</span>
                        </Checkbox>
                        <Checkbox
                          isChecked={checkedItems[2].length>0}
                          onChange={(e) => onSubFilterChange(e, 2)}
                        >
                           <span className="checkbox">Folder</span>
                        </Checkbox>
                      </Stack>
                    </Stack>
                  </CheckboxGroup>
                  {/* <CheckboxGroup colorScheme="blue" defaultValue={[]}>
                    <Stack>
                      <Checkbox value="text" onChange={handleTypeFilterChange}>
                        <span className="checkbox">Text</span>
                      </Checkbox>
                      <Checkbox value="image" onChange={handleTypeFilterChange}>
                        <span className="checkbox">Image</span>
                      </Checkbox>
                      <Checkbox value="folder" onChange={handleTypeFilterChange}>
                        <span className="checkbox">Folder</span>
                      </Checkbox>
                    </Stack>
                  </CheckboxGroup> */}
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
