import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import React, { Component } from 'react'
import { render } from 'react-dom'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

// eslint-disable-next-line new-cap
const SortableItem = SortableElement(({ value }: any) => <li>{value}</li>)

// eslint-disable-next-line new-cap
const SortableList = SortableContainer(({ items }: any) => {
  return (
    <ul>
      {items.pinsAdded.map((value: any, index: any) => (
        <li key={index}>{value}</li>
      ))}
    </ul>
  )
})

// export  SortableContainer(SortableList)
