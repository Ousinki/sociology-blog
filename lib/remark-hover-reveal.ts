import type { Plugin } from 'unified'
import type { Root, Text, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'

// Match [visible|hidden] syntax - the text between brackets with a pipe separator
const HOVER_REVEAL_PATTERN = /\[([^\]|]+)\|([^\]]+)\]/g

export const remarkHoverReveal: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const newChildren: any[] = []
      let hasChanges = false

      for (const child of node.children) {
        if (child.type === 'text') {
          const text = child.value
          let lastIndex = 0
          let match

          HOVER_REVEAL_PATTERN.lastIndex = 0
          while ((match = HOVER_REVEAL_PATTERN.exec(text)) !== null) {
            hasChanges = true

            // Add text before the match
            if (match.index > lastIndex) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastIndex, match.index),
              })
            }

            const visibleText = match[1]
            const hiddenText = match[2]

            // Create the hover-reveal span structure
            newChildren.push({
              type: 'mdxJsxTextElement',
              name: 'span',
              attributes: [
                { type: 'mdxJsxAttribute', name: 'className', value: 'hover-reveal' },
              ],
              children: [
                {
                  type: 'mdxJsxTextElement',
                  name: 'span',
                  attributes: [],
                  children: [{ type: 'text', value: visibleText }],
                },
                {
                  type: 'mdxJsxTextElement',
                  name: 'span',
                  attributes: [
                    { type: 'mdxJsxAttribute', name: 'className', value: 'hover-reveal-tooltip' },
                  ],
                  children: [{ type: 'text', value: hiddenText }],
                },
              ],
            })

            lastIndex = match.index + match[0].length
          }

          // Add remaining text after last match
          if (hasChanges && lastIndex < text.length) {
            newChildren.push({
              type: 'text',
              value: text.slice(lastIndex),
            })
          }

          if (!hasChanges) {
            newChildren.push(child)
          }
        } else {
          newChildren.push(child)
        }
      }

      if (hasChanges) {
        node.children = newChildren
      }
    })
  }
}

export default remarkHoverReveal
