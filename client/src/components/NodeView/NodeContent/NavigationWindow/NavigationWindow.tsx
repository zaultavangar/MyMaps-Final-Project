import { IPin, isSamePin, ITrail } from '../../../../types'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useRecoilState } from 'recoil'
import { prevNavigationPinState, currentNavigationPinState } from '../../../../global/Atoms'
import { IconButton } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './'
import './NavigationWindow.scss'

export interface INavigationWindowProps {
  trailToNavigate: ITrail
  selectedPin: IPin | null
  setSelectedPin: (pin: IPin | null) => void
  isNavigating: boolean
}


export const NavigationWindow = (props: INavigationWindowProps) => {
  const {trailToNavigate, selectedPin, setSelectedPin, isNavigating } = props

  const [prevNavigationPin, setPrevNavigationPin] = useRecoilState(prevNavigationPinState)
  const [currentNavigationPin, setCurrentNavigationPin] = useRecoilState(currentNavigationPinState)

  const handleStartNavigation = () => {
    let firstPin = trailToNavigate.pinList[0]
    setCurrentNavigationPin(trailToNavigate.pinList[0])
    setSelectedPin(firstPin)
  }

  return (
    <div className="navigation-window" key={trailToNavigate.trailId}>
    <div className="navigation-window-options">
      <div style={{cursor: 'pointer'}}>
        Hide
      </div>
    </div>
    <div className="navigation-window-header">
      <div className="nav-wind-route-title">Route: {trailToNavigate.title}</div>
      <div className="nav-wind-route-description">{trailToNavigate.explainer}</div>
    </div>
    <div className="navigation-window-subheader">
      <div className="nav-wind-pins-header">Pins</div>
        {currentNavigationPin !== null ? 
            <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                <button className='navigate-back-button'>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <NavigateBeforeIcon/>
                  </div>
                </button>
                <button className='navigate-next-button'>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <NavigateNextIcon />
                  </div>
                </button >
                <button className='navigate-restart-button'>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <RestartAltIcon/>
                  </div>
                </button>
            </div>
            :
            <button className="nav-wind-navigate-button" onClick={handleStartNavigation}>
              <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <PlayCircleOutlineIcon style={{paddingRight:'3px'}}/>
                <div>Navigate</div>
              </div>
            </button>
        }
    </div>
    <hr></hr>
    <div className="navigation-window-body">
      <ol>
        <div className="navigation-window-pins">
          {trailToNavigate.pinList.map(pin =>
          <div 
            className={`nav-wind-pin-wrapper ${isSamePin(selectedPin, pin) ? 'nav-pin-wrapper-selected' : ''} `} 
            onClick={()=> setSelectedPin(pin)}>
            <li>              
              {pin.title}              
            </li>
          </div>
            
          )}
      </div>
      </ol>
    </div>
     
  </div>
  )
}