import { INodePath, makeINodePath } from './INodePath'

// nodeTypes returns a string array of the types available
// From BQW: Needed to add in map and googleMap for the create modal to run properly.
export const nodeTypes: string[] = ['text', 'image', 'folder', 'map', 'googleMap']

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
  // support for keeping track of comment content on a map
  commentContent?: any
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
  nodeId: string,
  path: string[],
  pinId: string,
  children: string[] = [],
  type: NodeType = 'text',
  title: string | null = null,
  content: any = null
): INode {
  return {
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type,
    content: content ?? 'content' + nodeId,
    filePath: makeINodePath(path, children),
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
