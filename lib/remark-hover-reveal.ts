/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'unified'
import type { Root, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'

// Pattern for tooltip that follows a ruby-only pattern: {tooltip} or \{tooltip} (escaped in MDX)
const TOOLTIP_START_PATTERN = /^\\?\{([^}]+)\}/

// Helper to create ruby element
function createRubyElement(mainText: string, rubyText: string): any {
  return {
    type: 'mdxJsxTextElement',
    name: 'ruby',
    attributes: [],
    children: [
      { type: 'text', value: mainText },
      {
        type: 'mdxJsxTextElement',
        name: 'rt',
        attributes: [],
        children: [{ type: 'text', value: rubyText }],
      },
    ],
  }
}

// Helper to create hover-reveal element with tooltip
function createHoverRevealElement(innerElement: any, tooltipText: string): any {
  return {
    type: 'mdxJsxTextElement',
    name: 'span',
    attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'hover-reveal' }],
    children: [
      innerElement,
      {
        type: 'mdxJsxTextElement',
        name: 'span',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'hover-reveal-tooltip' }],
        children: [{ type: 'text', value: tooltipText }],
      },
    ],
  }
}

// Process text node and return segments
function processTextNode(text: string): {
  segments: any[]
  hasChanges: boolean
  endsWithPendingRuby: boolean
  pendingRubyData?: { mainText: string; rubyText: string }
} {
  const segments: any[] = []
  let lastIndex = 0
  let hasChanges = false
  let endsWithPendingRuby = false
  let pendingRubyData: { mainText: string; rubyText: string } | undefined

  // Combined pattern to match syntaxes
  const combinedPattern =
    /\[([^\]|]+)\|([^\]]+)\]{([^}]+)}|\[([^\]|]+)(?:\|([^\]]+))?\]{([^}]+)}|\[([^\]|]+)\|([^\]]+)\](?!{)/g

  let match
  combinedPattern.lastIndex = 0

  while ((match = combinedPattern.exec(text)) !== null) {
    hasChanges = true

    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      })
    }

    // Determine which pattern matched
    if (match[1] !== undefined && match[3] !== undefined) {
      // Pattern: [text|ruby]{tooltip}
      const mainText = match[1]
      const rubyText = match[2]
      const tooltipText = match[3]
      const rubyElement = createRubyElement(mainText, rubyText)
      segments.push(createHoverRevealElement(rubyElement, tooltipText))
    } else if (match[4] !== undefined && match[6] !== undefined) {
      // Pattern: [text]{tooltip} or [text|ruby]{tooltip}
      const mainText = match[4]
      const rubyText = match[5]
      const tooltipText = match[6]
      let mainElement: any
      if (rubyText) {
        mainElement = createRubyElement(mainText, rubyText)
      } else {
        mainElement = {
          type: 'mdxJsxTextElement',
          name: 'span',
          attributes: [],
          children: [{ type: 'text', value: mainText }],
        }
      }
      segments.push(createHoverRevealElement(mainElement, tooltipText))
    } else if (match[7] !== undefined && match[8] !== undefined) {
      // Pattern: [text|ruby] (ruby only, no tooltip)
      const mainText = match[7]
      const rubyTextVal = match[8]
      const matchEnd = match.index + match[0].length

      // Check if this ruby-only pattern is at the very end of the text
      if (matchEnd === text.length) {
        endsWithPendingRuby = true
        pendingRubyData = { mainText, rubyText: rubyTextVal }
        segments.push({
          type: '__pending_ruby__',
          mainText,
          rubyText: rubyTextVal,
        })
      } else {
        segments.push(createRubyElement(mainText, rubyTextVal))
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (hasChanges && lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex),
    })
  }

  return { segments, hasChanges, endsWithPendingRuby, pendingRubyData }
}

// Check if the last element in an array (recursively) is a pending ruby
function getLastPendingRuby(children: any[]): { found: boolean; path: number[] } {
  if (children.length === 0) return { found: false, path: [] }

  const lastChild = children[children.length - 1]

  if (lastChild.type === '__pending_ruby__') {
    return { found: true, path: [children.length - 1] }
  }

  // Check recursively in nested elements (strong, emphasis, etc.)
  if (lastChild.children && Array.isArray(lastChild.children)) {
    const result = getLastPendingRuby(lastChild.children)
    if (result.found) {
      return { found: true, path: [children.length - 1, ...result.path] }
    }
  }

  return { found: false, path: [] }
}

// Replace pending ruby at a given path with hover-reveal element
function replacePendingRubyAtPath(children: any[], path: number[], tooltipText: string): any[] {
  if (path.length === 0) return children

  const newChildren = [...children]
  const idx = path[0]

  if (path.length === 1) {
    // Direct replacement
    const pending = newChildren[idx]
    const rubyElement = createRubyElement(pending.mainText, pending.rubyText)
    newChildren[idx] = createHoverRevealElement(rubyElement, tooltipText)
  } else {
    // Recursive replacement in nested element
    const child = { ...newChildren[idx] }
    child.children = replacePendingRubyAtPath(child.children, path.slice(1), tooltipText)
    newChildren[idx] = child
  }

  return newChildren
}

// Convert pending ruby to regular ruby at a given path
function convertPendingRubyAtPath(children: any[], path: number[]): any[] {
  if (path.length === 0) return children

  const newChildren = [...children]
  const idx = path[0]

  if (path.length === 1) {
    const pending = newChildren[idx]
    newChildren[idx] = createRubyElement(pending.mainText, pending.rubyText)
  } else {
    const child = { ...newChildren[idx] }
    child.children = convertPendingRubyAtPath(child.children, path.slice(1))
    newChildren[idx] = child
  }

  return newChildren
}

// Process children - first pass: transform syntax, keep pending ruby markers
function processChildrenFirstPass(children: any[]): { newChildren: any[]; hasChanges: boolean } {
  const newChildren: any[] = []
  let hasChanges = false

  for (const child of children) {
    if (child.children && Array.isArray(child.children)) {
      // Recursively process nested elements
      const result = processChildrenFirstPass(child.children)
      if (result.hasChanges) {
        hasChanges = true
        newChildren.push({
          ...child,
          children: result.newChildren,
        })
      } else {
        newChildren.push(child)
      }
    } else if (child.type === 'text') {
      const result = processTextNode(child.value)
      if (result.hasChanges) {
        hasChanges = true
        newChildren.push(...result.segments)
      } else {
        newChildren.push(child)
      }
    } else {
      newChildren.push(child)
    }
  }

  return { newChildren, hasChanges }
}

// Second pass: resolve cross-boundary pending rubies
function resolveAcrossBoundaries(children: any[]): any[] {
  const result: any[] = []

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const nextChild = children[i + 1]

    // Check if this child (or its last nested child) is a pending ruby
    const pendingInfo = getLastPendingRuby([child])

    if (pendingInfo.found && nextChild && nextChild.type === 'text') {
      // Check if next sibling starts with tooltip
      const tooltipMatch = TOOLTIP_START_PATTERN.exec(nextChild.value)

      if (tooltipMatch) {
        // Replace pending ruby with hover-reveal
        const resolved = replacePendingRubyAtPath([child], pendingInfo.path, tooltipMatch[1])
        result.push(resolved[0])

        // Modify or remove next sibling
        const remaining = nextChild.value.slice(tooltipMatch[0].length)
        if (remaining) {
          children[i + 1] = { ...nextChild, value: remaining }
        } else {
          // Skip next child
          i++
        }
        continue
      }
    }

    // No cross-boundary match, convert any remaining pending rubies to regular rubies
    if (pendingInfo.found) {
      const converted = convertPendingRubyAtPath([child], pendingInfo.path)
      result.push(converted[0])
    } else {
      result.push(child)
    }
  }

  return result
}

export const remarkHoverReveal: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      // First pass: transform syntax
      const firstPassResult = processChildrenFirstPass(node.children as any[])

      if (firstPassResult.hasChanges) {
        // Second pass: resolve cross-boundary pending rubies
        const finalChildren = resolveAcrossBoundaries(firstPassResult.newChildren)
        node.children = finalChildren as any
      }
    })
  }
}

export default remarkHoverReveal
