import { isSameFilePath } from '.'
import INodePath, { makeINodePath } from './INodePath'

// nodeTypes returns a string array of the types available
export const nodeTypes: string[] = [
  'map',
  'text',
  'image',
  'folder',
  'googleMap',
  'dashboard',
]

// Supported nodeTypes for file browser
export type NodeType =
  | 'map'
  | 'googleMap'
  | 'text'
  | 'image'
  | 'folder'
  | 'pdf'
  | 'audio'
  | 'video'
  | 'dashboard'

// INode with node metadata
export interface INode {
  type: NodeType // type of node that is created
  content: any // the content of the node
  filePath: INodePath // unique randomly generated ID which contains the type as a prefix
  nodeId: string // unique randomly generated ID which contains the type as a prefix
  pinId: string
  title: string // user create node title
  dateCreated?: Date // date that the node was created
  // Support original and updated sizes as metadata
  originalWidth?: number
  originalHeight?: number
  updatedWidth?: number
  updatedHeight?: number
  commentContent?: string
}

/**
 * TODO [Editable]: Since we want to store new metadata for images we should add
 * new metadata fields to our INode object. There are different ways you can do this.
 *
 * 1. One would be creating a new interface that extends INode.
 * You can have a look at IFolderNode to see how it is done.
 * 2. Another would be to add optional metadata to the INode object itself.
 *
 * Note: Do not forget to update the NodeFields type
 */

export type FolderContentType = 'list' | 'grid'

export interface IFolderNode extends INode {
  viewType: FolderContentType
}

export type NodeFields = keyof INode | keyof IFolderNode

// Original and updated width/height added to the node fields
export const allNodeFields: string[] = [
  'nodeId',
  'title',
  'type',
  'content',
  'filePath',
  'viewType',
  'originalWidth',
  'originalHeight',
  'updatedWidth',
  'updatedHeight',
  'pinId',
  'commentContent',
]

// Type declaration for map from nodeId --> INode
export type NodeIdsToNodesMap = { [nodeId: string]: INode }

/**
 * Function that creates an INode given relevant inputs
 * @param nodeId
 * @param path
 * @param children
 * @param type
 * @param title
 * @param content
 * @param pinId
 * @returns INode object
 */

export function makeINode(
  nodeId: any,
  path: any,
  pinId: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any
): INode {
  return {
    content: content ?? 'content' + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type ?? 'text',
    pinId: pinId,
  }
}

export function makeIFolderNode(
  nodeId: any,
  path: any,
  pinId: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  viewType?: any
): IFolderNode {
  return {
    content: content ?? 'content' + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type ?? 'text',
    viewType: viewType ?? 'grid',
    pinId: pinId,
  }
}

export function isINode(object: any): object is INode {
  const propsDefined: boolean =
    typeof (object as INode).nodeId !== 'undefined' &&
    typeof (object as INode).pinId !== 'undefined' &&
    typeof (object as INode).title !== 'undefined' &&
    typeof (object as INode).type !== 'undefined' &&
    typeof (object as INode).content !== 'undefined' &&
    typeof (object as INode).filePath !== 'undefined'
  const filePath: INodePath = object.filePath
  // if both are defined
  if (filePath && propsDefined) {
    for (let i = 0; i < filePath.path.length; i++) {
      if (typeof filePath.path[i] !== 'string') {
        return false
      }
    }
    // check if all fields have the right type
    // and verify if filePath.path is properly defined
    return (
      typeof (object as INode).nodeId === 'string' &&
      typeof (object as INode).pinId === 'string' &&
      typeof (object as INode).title === 'string' &&
      nodeTypes.includes((object as INode).type) &&
      typeof (object as INode).content === 'string' &&
      filePath.path.length > 0 &&
      filePath.path[filePath.path.length - 1] === (object as INode).nodeId
    )
  }
}

export function isSameNode(n1: INode, n2: INode): boolean {
  return (
    n1.nodeId === n2.nodeId &&
    n1.pinId === n2.pinId &&
    n1.title === n2.title &&
    n1.type === n2.type &&
    n1.content === n2.content &&
    isSameFilePath(n1.filePath, n2.filePath)
  )
}
