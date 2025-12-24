/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

// 定義 directive 節點類型
interface DirectiveNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective'
  name: string
  attributes?: Record<string, string>
  children: any[]
  data?: any
}

// Callout 類型到圖標的映射
const calloutIcons: Record<string, string> = {
  note: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  tip: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  important:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  caution:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
}

// 支持的 callout 類型
const supportedTypes = ['note', 'tip', 'important', 'warning', 'caution', 'plain', 'info', 'danger']

// 從節點中提取 label（[title] 語法的內容）
function extractLabel(node: any): string | null {
  // remark-directive 會將 [label] 中的內容放到節點的 children 開頭作為一個特殊的 paragraph
  // 或者放到 node.children[0].children[0] 中
  // 實際上，[label] 的內容會作為第一個 children 節點
  if (node.children && node.children.length > 0) {
    const firstChild = node.children[0]
    // 檢查是否是純文本節點或 paragraph 節點
    if (firstChild.type === 'text') {
      return firstChild.value
    }
    if (firstChild.type === 'paragraph' && firstChild.children) {
      const textNode = firstChild.children.find((c: any) => c.type === 'text')
      if (textNode) {
        return textNode.value
      }
    }
  }
  return null
}

export const remarkDirectiveCallout: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective') {
        return
      }

      const directiveNode = node as DirectiveNode
      const type = directiveNode.name.toLowerCase()

      if (!supportedTypes.includes(type)) {
        return
      }

      // 檢查是否有 fold 屬性（支持 {fold} 或 {fold=true} 或 {fold="collapsed"}）
      const attrs = directiveNode.attributes || {}
      const hasFold =
        'fold' in attrs || attrs.fold === 'true' || attrs.fold === '' || attrs.fold === 'collapsed'
      const isCollapsed =
        attrs.fold === 'collapsed' || attrs.fold === '' || attrs.fold === 'true' || 'fold' in attrs

      // 獲取標題
      let title = type.charAt(0).toUpperCase() + type.slice(1)
      let labelNodeIndex = -1

      // 首先檢查 :::note[標題] 語法
      // remark-directive 會把 [標題] 解析為第一個 paragraph 並標記 data.directiveLabel = true
      if (directiveNode.children && directiveNode.children.length > 0) {
        const firstChild = directiveNode.children[0]
        if (firstChild.type === 'paragraph' && firstChild.data?.directiveLabel === true) {
          // 從這個 paragraph 中提取文本作為標題
          const textContent = firstChild.children
            ?.filter((c: any) => c.type === 'text')
            .map((c: any) => c.value)
            .join('')
          if (textContent) {
            title = textContent
            labelNodeIndex = 0 // 記錄需要移除的節點索引
          }
        }
      }

      // 然後檢查 {title="..."} 屬性（可以覆蓋 [label]）
      if (attrs.title) {
        title = attrs.title
      }

      const isPlain = type === 'plain'

      // 如果找到了 label 節點，從 children 中移除它（它會被用作標題）
      if (labelNodeIndex >= 0) {
        directiveNode.children.splice(labelNodeIndex, 1)
      }

      // 構建類名
      const classNames = ['directive-callout', `callout-${type}`]
      if (hasFold) {
        classNames.push('is-collapsible')
        if (isCollapsed) {
          classNames.push('is-collapsed')
        }
      }

      // 構建標題 JSX 節點
      const titleChildren: any[] = []

      // 如果是可折疊的，添加折疊圖標
      if (hasFold) {
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
            { type: 'mdxJsxAttribute', name: 'strokeLinecap', value: 'round' },
            { type: 'mdxJsxAttribute', name: 'strokeLinejoin', value: 'round' },
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

      // 添加類型圖標（非 plain 類型）
      const iconPath = calloutIcons[type] || calloutIcons['note']
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
            { type: 'mdxJsxAttribute', name: 'strokeLinecap', value: 'round' },
            { type: 'mdxJsxAttribute', name: 'strokeLinejoin', value: 'round' },
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

      // 添加標題文本
      titleChildren.push({
        type: 'mdxJsxTextElement',
        name: 'span',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-title-inner' }],
        children: [{ type: 'text', value: title }],
      })

      // 創建標題元素
      const titleElement = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-title' }],
        children: titleChildren,
      }

      // 包裝內容
      const contentElement = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'callout-content' }],
        children: [...directiveNode.children] as any[],
      }

      // 轉換節點類型為 div
      directiveNode.type = 'containerDirective' as any
      directiveNode.data = {
        hName: 'div',
        hProperties: {
          className: classNames.join(' '),
          'data-callout': type,
          'data-collapsible': hasFold ? 'true' : 'false',
        },
      }
      directiveNode.children = [titleElement as any, contentElement as any]
    })
  }
}

export default remarkDirectiveCallout
