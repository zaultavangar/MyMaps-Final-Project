import React, { useCallback } from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'

import { NodeIdsToNodesMap } from '../../types'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { isLinkingState, startAnchorState, selectedExtentState } from '../../global/Atoms'
import './Header.scss'

interface IHeaderProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onCreateNodeButtonClick: () => void
  onCreateMapButtonClick: () => void
  onHomeClick: () => void
  setSearchModalOpen: (value: boolean) => void
}

export const Header = (props: IHeaderProps) => {
  const {
    onCreateNodeButtonClick,
    onCreateMapButtonClick,
    onHomeClick,
    nodeIdsToNodesMap,
    setSearchModalOpen,
  } = props
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }

  const handleSearchClick = useCallback(() => {
    setSearchModalOpen(true)
  }, [])

  return (
    <div className={isLinking ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/'}>
          <div className="name" onClick={onHomeClick}>
            My<b>Hypermedia</b>
          </div>
        </Link>
        <Link to={'/'}>
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
        <Button
          isWhite={isLinking}
          icon={<ai.AiOutlinePlus />}
          text="New Map"
          onClick={onCreateMapButtonClick}
          style={{
            width: 'max-content',
            height: 30,
            marginLeft: 10,
          }}
        />
      </div>
      {isLinking && startAnchor ? (
        <div className="right-bar">
          <div className="linking-from">
            Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
          </div>
          <Button
            icon={<ri.RiSearchEyeLine />}
            text="Search"
            onClick={() => handleSearchClick()}
            isWhite
            style={{
              width: 'fit-content',
              height: 30,
              fontWeight: 600,
            }}
          />
          <Button
            onClick={handleCancelLink}
            isWhite
            text="Cancel"
            style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
            icon={<ri.RiCloseLine />}
          />
        </div>
      ) : (
        <div className="right-bar">
          <div className="button-right-bar">
            <Button
              icon={<ri.RiSearchEyeLine />}
              text="Search"
              onClick={() => handleSearchClick()}
              style={{
                width: 'fit-content',
                height: 30,
                fontWeight: 600,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
