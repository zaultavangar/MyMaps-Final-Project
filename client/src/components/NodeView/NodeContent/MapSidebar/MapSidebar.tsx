import React, { useEffect, useRef, useState, useCallback } from 'react'
import './MapSidebar.scss'

export const MapSidebar = () => {


  return (
    <div className='map-sidebar-wrapper'>
      <h1 className="pins-header" style={{fontSize:"20px"}}> Pins</h1>
      <ol>
        <li>Pin 1</li>
        <li>Pin 2</li>
        <li>Pin 3</li>
        <li>Pin 4</li>
      </ol>
      <p>
        Note: I think this box can be replaced by an adjustable side menu, like done with the NodeLinkMenu displaying the anchors and links.
        I added something in the code in NodeView for this type of side menu to appear if there are pins for a certain map node. The content
        of the side menu hasn't been written yet, but I think the font and overall formatting should look similar to the NodeLinkMenu for 
        consistency. I think it would be nice if when no pins are clicked, the side menu just displays all the pins, and then when a pin is 
        clicked, the side menu changes to show the documents for that pin and more, as we designed in Figma.
      </p>
    </div>
  )
}