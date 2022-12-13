import { IPin, isSamePin, ITrail } from '../../../../types'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { useRecoilState } from 'recoil'
import {
  prevNavigationPinState,
  currentNavigationPinState,
  selectedPinState,
} from '../../../../global/Atoms'
import { IconButton } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import './'
import './NavigationWindow.scss'
import React, { useEffect, useState } from 'react'

export interface INavigationWindowProps {
  trailToNavigate: ITrail
  isNavigating: boolean
}

export const NavigationWindow = (props: INavigationWindowProps) => {
  const { trailToNavigate, isNavigating } = props

  const [selectedPin, setSelectedPin] = useRecoilState(selectedPinState)

  const [prevNavigationPin, setPrevNavigationPin] = useRecoilState(prevNavigationPinState)
  const [currentNavigationPin, setCurrentNavigationPin] = useRecoilState(
    currentNavigationPinState
  )

  const [windowHidden, setWindowHidden] = useState(false)

  const handleStartNavigationClick = () => {
    const firstPin = trailToNavigate.pinList[0]
    setCurrentNavigationPin(trailToNavigate.pinList[0])
    setSelectedPin(firstPin)
    setPrevNavigationPin(null)
  }

  const handleBackNavigationClick = () => {
    if (currentNavigationPin) {
      const index = trailToNavigate.pinList.indexOf(currentNavigationPin)
      if (index <= 0) return
      setSelectedPin(prevNavigationPin)
      setCurrentNavigationPin(prevNavigationPin)
      setPrevNavigationPin(trailToNavigate.pinList[index - 1])
    }
  }

  const handleNextNavigationClick = () => {
    if (currentNavigationPin) {
      const pinList = trailToNavigate.pinList
      const index = pinList.indexOf(currentNavigationPin)
      if (index < 0) return // || index == pinList.length-1
      setPrevNavigationPin(currentNavigationPin)
      setSelectedPin(pinList[index + 1])
      setCurrentNavigationPin(pinList[index + 1])
    }
  }

  const handleRestartButtonClick = () => {
    if (currentNavigationPin) {
      setPrevNavigationPin(null)
      setSelectedPin(trailToNavigate.pinList[0])
      setCurrentNavigationPin(trailToNavigate.pinList[0])
    }
  }

  const toggleWindowClick = () => {
    setWindowHidden(!windowHidden)
  }

  useEffect(() => {
    setPrevNavigationPin(null)
    setSelectedPin(trailToNavigate.pinList[0])
    setCurrentNavigationPin(trailToNavigate.pinList[0])
  }, [isNavigating])
  const isFirst: boolean = trailToNavigate.pinList[0] === selectedPin
  const isLast: boolean =
    trailToNavigate.pinList[trailToNavigate.pinList.length - 1] === selectedPin

  return (
    <div>
      {windowHidden ? (
        <div className="navigation-window-hidden">
          <div className="hidden-navigation-window-options">
            <div style={{ cursor: 'pointer' }} onClick={toggleWindowClick}>
              Show
            </div>
          </div>
        </div>
      ) : (
        <div className="navigation-window" key={trailToNavigate.trailId}>
          <div className="navigation-window-options">
            <div style={{ cursor: 'pointer' }} onClick={toggleWindowClick}>
              Hide
            </div>
          </div>
          <div className="navigation-window-header">
            <div className="nav-wind-route-title">Route: {trailToNavigate.title}</div>
            <div className="nav-wind-route-description">{trailToNavigate.explainer}</div>
          </div>
          <div className="navigation-window-subheader">
            <div className="nav-wind-pins-header">Pins</div>
            {currentNavigationPin !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {!isFirst && (
                  <button
                    className="navigate-back-button"
                    onClick={handleBackNavigationClick}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <NavigateBeforeIcon />
                    </div>
                  </button>
                )}
                {!isLast && (
                  <button
                    className="navigate-next-button"
                    onClick={handleNextNavigationClick}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <NavigateNextIcon />
                    </div>
                  </button>
                )}
                <button
                  className="navigate-restart-button"
                  onClick={handleRestartButtonClick}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <RestartAltIcon />
                  </div>
                </button>
              </div>
            ) : (
              <button
                className="nav-wind-navigate-button"
                onClick={handleStartNavigationClick}
              >
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <PlayCircleOutlineIcon style={{ paddingRight: '3px' }} />
                  <div>Navigate</div>
                </div>
              </button>
            )}
          </div>
          <hr></hr>
          <div className="navigation-window-body">
            <ol>
              <div className="navigation-window-pins">
                {trailToNavigate.pinList.map((pin) => (
                  <div
                    key={pin.pinId}
                    className={`nav-wind-pin-wrapper ${
                      isSamePin(selectedPin, pin) ? 'nav-pin-wrapper-selected' : ''
                    } `}
                    onClick={() => setSelectedPin(pin)}
                  >
                    <li>{pin.title}</li>
                  </div>
                ))}
              </div>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
