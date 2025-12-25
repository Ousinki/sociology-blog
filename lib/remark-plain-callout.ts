/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'unified'
import type { Root, Blockquote, Paragraph, Text } from 'mdast'
import { visit, SKIP } from 'unist-util-visit'

// Regex to match callout syntax: [!type], [!type]+, [!type]-, [!type] title, [!type]+ title, [!type]- title
const CALLOUT_REGEX = /^\[!(\w+)\]([+-])?(?:\s+(.+?))?\s*$/i

export const remarkPlainCallout: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!node.children || node.children.length === 0) return
      if (index === undefined || !parent) return

      const firstChild = node.children[0]
      if (firstChild.type !== 'paragraph') return

      const paragraph = firstChild as Paragraph
      if (!paragraph.children || paragraph.children.length === 0) return

      const firstTextNode = paragraph.children[0]
      if (firstTextNode.type !== 'text') return

      const textNode = firstTextNode as Text
      const firstLine = textNode.value.split('\n')[0]
      const match = firstLine.match(CALLOUT_REGEX)
      if (!match) return

      const type = match[1].toLowerCase()
      const collapseIndicator = match[2] // + or - or undefined
      const customTitle = match[3]?.trim()
      
      // Skip standard GitHub alerts without custom title AND without collapse indicator
      const githubAlertTypes = ['note', 'tip', 'warning', 'caution', 'important']
      if (githubAlertTypes.includes(type) && !customTitle && !collapseIndicator) {
        return
      }

      // Determine collapse state
      const isCollapsible = collapseIndicator === '+' || collapseIndicator === '-'
      const isCollapsed = collapseIndicator === '-'

      // Title: custom or default capitalized type
      const title = customTitle || type.charAt(0).toUpperCase() + type.slice(1)

      // Remove the [!type] title line from textNode
      const lines = textNode.value.split('\n')
      const contentLines = lines.slice(1)
      
      if (contentLines.length > 0 && contentLines.join('\n').trim()) {
        textNode.value = contentLines.join('\n')
      } else {
        paragraph.children = paragraph.children.slice(1)
        if (paragraph.children.length === 0) {
          node.children = node.children.slice(1)
        }
      }

      // Build class names - use markdown-alert classes for styling
      // and collapsible-callout + is-collapsible for collapse functionality
      let alertClass = `markdown-alert markdown-alert-${type}`
      if (isCollapsible) {
        alertClass += ' collapsible-callout is-collapsible'
        if (isCollapsed) {
          alertClass += ' is-collapsed'
        }
      }

      // Create structure
      const calloutNode: any = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'className',
            value: alertClass,
          },
        ],
        children: [
          // Title - add callout-title class for click handling
          {
            type: 'mdxJsxFlowElement',
            name: 'div',
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'className',
                value: 'markdown-alert-title callout-title',
              },
            ],
            children: [
              // Add fold icon if collapsible
              ...(isCollapsible
                ? [
                    {
                      type: 'mdxJsxFlowElement',
                      name: 'span',
                      attributes: [
                        {
                          type: 'mdxJsxAttribute',
                          name: 'className',
                          value: 'fold-icon',
                        },
                      ],
                      children: [{ type: 'text', value: '▶' }],
                    },
                  ]
                : []),
              { type: 'text', value: title },
            ],
          },
          // Content
          {
            type: 'mdxJsxFlowElement',
            name: 'div',
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'className',
                value: 'callout-content',
              },
            ],
            children: [...node.children],
          },
        ],
      }

      // Replace the blockquote with the callout
      ;(parent.children as any)[index] = calloutNode
      
      return SKIP
    })
  }
}

export default remarkPlainCallout
