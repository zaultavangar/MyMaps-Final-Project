import React from 'react'
import { NodeType } from '../../../../../../types'
import { ImagePreviewContent } from './ImagePreviewContent'
import './NodePreviewContent.scss'
import { TextPreviewContent } from './TextPreviewContent'

/** Props needed to render any node content */
export interface INodeContentPreviewProps {
  content: any
  type: NodeType
}

export const NodePreviewContent = (props: INodeContentPreviewProps) => {
  const { type, content } = props
  switch (type) {
    case 'image':
    case 'map':
      return <ImagePreviewContent content={content} />
    case 'text':
      return <TextPreviewContent content={content} />
    case 'googleMap':
      return (
        <ImagePreviewContent
          content={
            'https://assets.website-files.com/5d3ef00c73102c436bc83996/' +
            '5d3ef00c73102c893bc83a28_logo-regular.png'
          }
        />
      )
    default:
      return null
  }
}
