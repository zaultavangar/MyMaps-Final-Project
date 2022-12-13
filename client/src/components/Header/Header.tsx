import React, { useCallback } from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'

import { NodeIdsToNodesMap } from '../../types'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  isLinkingState,
  isNavigatingState,
  startAnchorState,
  selectedExtentState,
  trailToNavigateState,
} from '../../global/Atoms'
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
    onCreateMapButtonClick,
    onHomeClick,
    nodeIdsToNodesMap,
    setSearchModalOpen,
  } = props
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [isNavigating, setIsNavigating] = useRecoilState(isNavigatingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const [trailToNavigate, setTrailToNavigate] = useRecoilState(trailToNavigateState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }

  const handleCancelNavigation = () => {
    setIsNavigating(false)
    setTrailToNavigate(null)
  }

  const handleSearchClick = useCallback(() => {
    setSearchModalOpen(true)
  }, [])

  return (
    <div className={isLinking || isNavigating ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/'}>
          <div className="name" onClick={onHomeClick}>
            My<b>Maps</b>
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
      {(isLinking && startAnchor) || (isNavigating && trailToNavigate) ? (
        <>
          {isLinking && startAnchor && (
            <div className="right-bar">
              <div className="linking-from">
                Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
              </div>
              <Button
                onClick={handleCancelLink}
                isWhite
                text="Cancel"
                style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
                icon={<ri.RiCloseLine />}
              />
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
            </div>
          )}
          {isNavigating && trailToNavigate && (
            <div className="right-bar">
              <div className="linking-from">
                Navigating <b>{trailToNavigate.title}</b>
              </div>
              <Button
                onClick={handleCancelNavigation}
                isWhite
                text="Cancel"
                style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
                icon={<ri.RiCloseLine />}
              />
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
            </div>
          )}
        </>
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
