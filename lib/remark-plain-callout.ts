import type { Plugin } from 'unified'
import type { Root, Blockquote, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'

// Callout type icons (SVG paths)
const calloutIcons: Record<string, string> = {
  note: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  tip: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  important: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  caution: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
}

// Regex to match callout syntax: [!type] or [!type]+ or [!type]-
const CALLOUT_REGEX = /^\[!(\w+)\]([+-])?(?:\s+(.*))?$/i

export const remarkPlainCallout: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!node.children || node.children.length === 0) return
      
      const firstChild = node.children[0]
      if (firstChild.type !== 'paragraph') return
      
      const firstTextNode = firstChild.children?.find((c: any) => c.type === 'text')
      if (!firstTextNode || typeof firstTextNode.value !== 'string') return
      
      const match = firstTextNode.value.match(CALLOUT_REGEX)
      if (!match) return
      
      const type = match[1].toLowerCase()
      const collapseState = match[2] // + or - or undefined
      const customTitle = match[3]?.trim()
      
      const isCollapsible = collapseState === '+' || collapseState === '-'
      const isCollapsed = collapseState === '-'
      
      // Default title is the type capitalized
      const title = customTitle || type.charAt(0).toUpperCase() + type.slice(1)
      
      // Build class names
      const classNames = ['collapsible-callout', `callout-${type}`]
      if (isCollapsible) {
        classNames.push('is-collapsible')
        if (isCollapsed) {
          classNames.push('is-collapsed')
        }
      }
      
      // Get icon path
      const iconPath = calloutIcons[type] || calloutIcons['note']
      const isPlain = type === 'plain'
      
      // Build title children
      const titleChildren: any[] = []
      
      // Add fold icon if collapsible
      if (isCollapsible) {
        titleChildren.push({
          type: 'mdxJsxTextElement',
          name: 'svg',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'fold-icon' },
            { type: 'mdxJsxAttribute', name: 'xmlns', value: 'http://www.w3.org/2000/svg' },
            { type: 'mdxJsxAttribute', name: 'width', value: '16' },
            { type: 'mdxJsxAttribute', name: 'height', value: '16' },
            { type: 'mdxJsxAttribute', name: 'viewBox', value: '0 0 24 24' },
            { type: 'mdxJsxAttribute', name: 'fill', value: 'none' },
            { type: 'mdxJsxAttribute', name: 'stroke', value: 'currentColor' },
            { type: 'mdxJsxAttribute', name: 'strokeWidth', value: '2' },
          ],
          children: [
            {
              type: 'mdxJsxTextElement',
              name: 'polyline',
              attributes: [{ type: 'mdxJsxAttribute', name: 'points', value: '6 9 12 15 18 9' }],
              children: [],
            },
          ],
        })
      }
      
      // Add type icon (except for plain)
      if (!isPlain && iconPath) {
        titleChildren.push({
          type: 'mdxJsxTextElement',
          name: 'svg',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'callout-icon' },
            { type: 'mdxJsxAttribute', name: 'xmlns', value: 'http://www.w3.org/2000/svg' },
            { type: 'mdxJsxAttribute', name: 'width', value: '18' },
            { type: 'mdxJsxAttribute', name: 'height', value: '18' },
            { type: 'mdxJsxAttribute', name: 'viewBox', value: '0 0 24 24' },
            { type: 'mdxJsxAttribute', name: 'fill', value: 'none' },
            { type: 'mdxJsxAttribute', name: 'stroke', value: 'currentColor' },
            { type: 'mdxJsxAttribute', name: 'strokeWidth', value: '2' },
          ],
          children: [
            {
              type: 'mdxJsxTextElement',
              name: 'path',
              attributes: [{ type: 'mdxJsxAttribute', name: 'd', value: iconPath }],
              children: [],
            },
          ],
        })
      }
      
      // Add title text
      titleChildren.push({
        type: 'mdxJsxTextElement',
        name: 'span',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-title-inner' }],
        children: [{ type: 'text', value: title }],
      })
      
      // Create title element
      const titleElement = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-title' }],
        children: titleChildren,
      }
      
      // Remove the callout syntax from content
      const remainingText = firstTextNode.value.replace(CALLOUT_REGEX, '').trim()
      if (remainingText) {
        firstTextNode.value = remainingText
      } else {
        // Remove the first text node if it's empty
        firstChild.children = firstChild.children?.filter((c: any) => c !== firstTextNode) || []
        // If paragraph is now empty, remove it
        if (firstChild.children.length === 0) {
          node.children = node.children.slice(1)
        }
      }
      
      // Create content element
      const contentElement = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-content' }],
        children: [...node.children] as any[],
      }
      
      // Transform the blockquote into a div
      (node as any).type = 'mdxJsxFlowElement'
      ;(node as any).name = 'div'
      ;(node as any).attributes = [
        { type: 'mdxJsxAttribute', name: 'className', value: classNames.join(' ') },
        { type: 'mdxJsxAttribute', name: 'data-callout', value: type },
        { type: 'mdxJsxAttribute', name: 'data-collapsible', value: isCollapsible ? 'true' : 'false' },
      ]
      node.children = [titleElement as any, contentElement as any]
    })
  }
}

export default remarkPlainCallout
