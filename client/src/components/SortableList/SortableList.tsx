import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import React, {Component} from 'react'
import {render} from 'react-dom'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'



const SortableItem = SortableElement(({value}: any) => <li>{value}</li>)

const SortableList = SortableContainer(({items}: any) => {
  return (
    <ul>
    {items.pinsAdded.map((value: any, index: any) => 
      <li>{value}</li>
    )}
    </ul>
  )
})



// export  SortableContainer(SortableList)