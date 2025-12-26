/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'unified'
import type { Root, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'

// Match ::text:: syntax for weakened text
const WEAKEN_PATTERN = /::([^:]+)::/g

export const remarkWeaken: Plugin<[], Root> = () => {
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

          WEAKEN_PATTERN.lastIndex = 0
          while ((match = WEAKEN_PATTERN.exec(text)) !== null) {
            console.log('[remarkWeaken] FOUND MATCH:', match[0])
            childHasChanges = true
            hasChanges = true

            // Add text before the match
            if (match.index > lastIndex) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastIndex, match.index),
              })
            }

            const weakenedText = match[1]

            // Create the weakened element using span with class and data attribute
            newChildren.push({
              type: 'mdxJsxTextElement',
              name: 'span',
              attributes: [
                { type: 'mdxJsxAttribute', name: 'className', value: 'weakened-text' },
                { type: 'mdxJsxAttribute', name: 'data-weakened', value: 'true' },
              ],
              children: [{ type: 'text', value: weakenedText }],
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
        console.log('[remarkWeaken] Modifying paragraph, new children count:', newChildren.length)
        node.children = newChildren
      }
    })
  }
}

export default remarkWeaken
