import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { FrontendAnchorGateway } from '../../../../anchors'
import {
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  selectedAnchorsState,
  selectedExtentState,
  startAnchorState,
} from '../../../../global/Atoms'
import { FrontendLinkGateway } from '../../../../links'
import { FrontendNodeGateway } from '../../../../nodes'
import {
  Extent,
  failureServiceResponse,
  IAnchor,
  ILink,
  INodeProperty,
  IServiceResponse,
  ITextExtent,
  makeINodeProperty,
  successfulServiceResponse,
} from '../../../../types'
import './TextContent.scss'
import { TextMenu } from './TextMenu'
import { Link } from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight/lib/core'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import c from 'highlight.js/lib/languages/c'

lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)
lowlight.registerLanguage('python', python)
lowlight.registerLanguage('java', java)
lowlight.registerLanguage('c', c)

interface ITextContentProps {}

/** The content of an text node, including all its anchors */
export const TextContent = (props: ITextContentProps) => {
  const currentNode = useRecoilValue(currentNodeState)
  const startAnchor = useRecoilValue(startAnchorState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState)
  const [linkMenuRefresh, setLinkMenuRefresh] = useRecoilState(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const [onSave, setOnSave] = useState(false)
  const save = () => {
    setOnSave(!onSave)
  }

  const history = useHistory()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1],
          HTMLAttributes: {
            style: 'font-size: 1.8em;',
          },
        },
      }),
      Highlight,
      Superscript,
      Subscript,
      Link.configure({ openOnClick: true, autolink: false, linkOnPaste: false }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          style:
            // eslint-disable-next-line quotes
            "background: #0d0d0d; border-radius: 0.5 rem; color: #fff; font-family: 'JetBrainsMono', monospace; padding: 0.75rem 1rem;",
        },
      }),
    ],
    content: currentNode.content,
    autofocus: false,
  })

  // Updates the content of a node
  const updateNodeContent = async (): Promise<IServiceResponse<any>> => {
    const editorHtml = editor?.getHTML() // get current editor document as HTML
    const nodeProperty: INodeProperty = makeINodeProperty('content', editorHtml)
    const updateNodeResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ]) // update the node with it's new content
    if (!updateNodeResp.success) {
      return failureServiceResponse('Failed to update node content')
    }
    return successfulServiceResponse('Node content updated successfully')
  }

  const updateAnchors = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse('Null editor')
    }
    // Get all anchors for the current node
    const getAnchorsResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (!getAnchorsResp.success) {
      return failureServiceResponse('Failed to fetch anchors')
    }
    const currentNodeDatabaseAnchors = getAnchorsResp.payload
    if (!currentNodeDatabaseAnchors) {
      return successfulServiceResponse('No anchors to update')
    }

    // Loop through link marks in the text editor, by iterating through Prosemirror nodes
    // eslint-disable-next-line space-before-function-paren
    editor.state.doc.descendants(function (node, pos, parent, index) {
      const linkMarks = node.marks.filter((mark) => mark.type.name == 'link')
      // if anchor found
      if (linkMarks && linkMarks.length > 0) {
        const anchorMark = linkMarks[0] // get mark from array
        const anchorId = anchorMark.attrs.target // gets anchorId from HTML attributes
        // Only intertested in the links that have a target starting with "anchor"
        if (anchorId.includes('anchor')) {
          let anchorFound = false
          for (let i = 0; i < currentNodeDatabaseAnchors.length; i++) {
            // if anchor in database equal to this anchor
            if (currentNodeDatabaseAnchors[i].anchorId == anchorId) {
              anchorFound = true
              // remove found anchor from list
              currentNodeDatabaseAnchors.splice(i, 1)
              break
            }
          }
          if (!anchorFound) {
            return // no need to edit anchor's extent if not found
          }
          // get anchor text length (note: node.text.length could be null)
          // in which case length=0
          const length = node.text?.length ?? 0
          const newExtent: Extent = {
            endCharacter: pos + length - 1,
            startCharacter: pos - 1,
            text: node.text ?? '',
            type: 'text',
          }
          // Update anchor's extent
          FrontendAnchorGateway.updateExtent(anchorId, newExtent)
        }
      }
    })

    await deleteAppropriateAnchors(currentNodeDatabaseAnchors)
    return successfulServiceResponse('Anchors successfully updated')
  }

  const deleteAppropriateAnchors = async (currentNodeDatabaseAnchors: IAnchor[]) => {
    currentNodeDatabaseAnchors.forEach(async (anchor) => {
      // Delete anchor that's no longer in the editor but still in database
      const deleteAnchorResp = await FrontendAnchorGateway.deleteAnchor(anchor.anchorId)
      if (!deleteAnchorResp.success) {
        return failureServiceResponse('Failed to delete anchor')
      }

      const getLinksResp = await FrontendLinkGateway.getLinksByAnchorId(anchor.anchorId)
      if (!getLinksResp.success || !getLinksResp.payload) {
        return failureServiceResponse('Failed to retrieve links')
      }
      const anchorLinks = getLinksResp.payload // links from the anchor
      // Loop through links
      anchorLinks.forEach(async (link: ILink) => {
        // Set anchor2Id as opposite anchorId
        const anchor2Id =
          link.anchor1Id == anchor.anchorId ? link.anchor2Id : link.anchor1Id

        // Check if opposite anchor as more than one link associated with it
        // If not, then it is an orphan anchor and is thus deleted
        const getLinksResp2 = await FrontendLinkGateway.getLinksByAnchorId(anchor2Id)
        if (!getLinksResp2.success || !getLinksResp2.payload) {
          return failureServiceResponse('Failed to retrieve links')
        }
        if (getLinksResp2.payload.length < 2) {
          const deleteAnchorResp2 = await FrontendAnchorGateway.deleteAnchor(anchor2Id)
          if (!deleteAnchorResp2.success) {
            return failureServiceResponse('Failed to delete anchor')
          }
        }
        // Delete the link itself
        const deleteLinkResp = await FrontendLinkGateway.deleteLink(link.linkId)
        if (deleteLinkResp.success) {
          return failureServiceResponse('Failed to delete link')
        }
      })
    })
  }

  // This function adds anchor marks for anchors in the database to the text editor
  // TODO: Replace 'http://localhost:3000/' with your frontend URL when you're ready to deploy
  const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse('no editor')
    }
    const anchorMarks: ITextExtent[] = []
    const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (!anchorResponse || !anchorResponse.success) {
      return failureServiceResponse('failed to get anchors')
    }
    if (!anchorResponse.payload) {
      return successfulServiceResponse('no anchors to add')
    }
    for (let i = 0; i < anchorResponse.payload?.length; i++) {
      const anchor = anchorResponse.payload[i]
      const linkResponse = await FrontendLinkGateway.getLinksByAnchorId(anchor.anchorId)
      if (!linkResponse.success || !linkResponse.payload) {
        return failureServiceResponse('failed to get link')
      }
      const link = linkResponse.payload[0]
      let node = link.anchor1NodeId
      if (node == currentNode.nodeId) {
        node = link.anchor2NodeId
      }
      if (anchor.extent && anchor.extent.type == 'text') {
        editor.commands.setTextSelection({
          from: anchor.extent.startCharacter + 1,
          to: anchor.extent.endCharacter + 1,
        })
        editor.commands.setLink({
          href: 'http://localhost:3000/' + node + '/',
          target: anchor.anchorId,
        })
      }
    }
    return successfulServiceResponse('added anchors')
  }

  // Set the selected extent to null when this component loads
  useEffect(() => {
    setSelectedExtent(null)
  }, [currentNode])

  // Set the content and add anchor marks when this component loads
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentNode.content) // replace content
      editor.commands.selectAll() // In this way, any toggled buttons reset
      editor.commands.unsetLink() // Remove link marks before using setLink in addAnchorMarks
      addAnchorMarks().then(() => {
        updateNodeContent()
      })
    }
  }, [currentNode, editor])

  // Same as above on refresh except for setContent
  useEffect(() => {
    if (editor) {
      editor.commands.selectAll()
      editor.commands.unsetLink()
      addAnchorMarks().then(() => {
        updateNodeContent()
      })
    }
  }, [anchorRefresh, refresh])

  // useEffect that handles when 'Save' button is clicked
  useEffect(() => {
    if (editor) {
      updateAnchors().then(() => {
        // update the anchors as needed
        updateNodeContent().then(() => {
          // update the content once more, refresh accordingly
          setAnchorRefresh(!anchorRefresh)
          setLinkMenuRefresh(!linkMenuRefresh)
          setRefresh(!refresh)
        })
      })
    }
  }, [onSave])

  // Handle setting the selected extent
  const onPointerUp = (e: React.PointerEvent) => {
    if (!editor) {
      return
    }
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const text = editor.state.doc.textBetween(from, to)
    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from - 1,
        endCharacter: to - 1,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div>
      <TextMenu editor={editor} save={save} />
      <EditorContent editor={editor} onPointerUp={onPointerUp} />
    </div>
  )
}
