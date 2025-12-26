/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'unified'
import type { Root, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'

// Match ==text== syntax for highlighting
const MARK_PATTERN = /==([^=]+)==/g

export const remarkMarkHighlight: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const newChildren: any[] = []
      let hasChanges = false

      for (const child of node.children) {
        if (child.type === 'text') {
          const text = child.value
          let lastIndex = 0
          let match
          let childHasChanges = false

          MARK_PATTERN.lastIndex = 0
          while ((match = MARK_PATTERN.exec(text)) !== null) {
            console.log('[remarkMarkHighlight] FOUND MATCH:', match[0])
            childHasChanges = true
            hasChanges = true

            // Add text before the match
            if (match.index > lastIndex) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastIndex, match.index),
              })
            }

            const highlightedText = match[1]

            // Create the highlight element using span with class
            newChildren.push({
              type: 'mdxJsxTextElement',
              name: 'span',
              attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'highlight-mark' }],
              children: [{ type: 'text', value: highlightedText }],
            })

            lastIndex = match.index + match[0].length
          }

          // Add remaining text after last match
          if (childHasChanges && lastIndex < text.length) {
            newChildren.push({
              type: 'text',
              value: text.slice(lastIndex),
            })
          }

          // If no matches in this child, keep original
          if (!childHasChanges) {
            newChildren.push(child)
          }
        } else {
          newChildren.push(child)
        }
      }

      if (hasChanges) {
        console.log(
          '[remarkMarkHighlight] Modifying paragraph, new children count:',
          newChildren.length
        )
        node.children = newChildren
      }
    })
  }
}

export default remarkMarkHighlight
