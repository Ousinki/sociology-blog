'use client'

import { useEffect } from 'react'

const RUBY_SWAPPED_KEY = 'ruby-swapped'
const RUBY_HIDDEN_KEY = 'ruby-hidden'

function getRubySwapped(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(RUBY_SWAPPED_KEY) === 'true'
}

function getRubyHidden(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(RUBY_HIDDEN_KEY) === 'true'
}

function setRubySwapped(swapped: boolean) {
  localStorage.setItem(RUBY_SWAPPED_KEY, swapped.toString())
  document.documentElement.setAttribute('ruby-swapped', swapped.toString())
}

function setRubyHidden(hidden: boolean) {
  localStorage.setItem(RUBY_HIDDEN_KEY, hidden.toString())
  document.documentElement.setAttribute('ruby-hidden', hidden.toString())
}

// 切换 Ruby 标签中原文和上标的位置
function swapRubyContentAdvanced() {
  const rubies = document.querySelectorAll('ruby')
  rubies.forEach((ruby) => {
    const rt = ruby.querySelector('rt')
    if (!rt) return

    // 获取所有子节点（除了 rt）
    const mainNodes: Node[] = []
    Array.from(ruby.childNodes).forEach((node) => {
      if (node !== rt) {
        mainNodes.push(node)
      }
    })

    // 保存 rt 的内容（包括 HTML）
    const rtContent = rt.innerHTML

    // 保存主内容的 HTML
    const tempDiv = document.createElement('div')
    mainNodes.forEach((node) => {
      tempDiv.appendChild(node.cloneNode(true))
    })
    const mainContent = tempDiv.innerHTML

    // 清空 Ruby 标签
    ruby.innerHTML = ''

    // 将 rt 的内容作为新的主内容
    const tempMain = document.createElement('div')
    tempMain.innerHTML = rtContent
    while (tempMain.firstChild) {
      ruby.appendChild(tempMain.firstChild)
    }

    // 创建新的 rt，包含原来的主内容
    const newRt = document.createElement('rt')
    newRt.innerHTML = mainContent
    ruby.appendChild(newRt)
  })
}

// 应用隐藏/显示 Ruby 上标
function applyRubyHidden(hidden: boolean) {
  const rubies = document.querySelectorAll('ruby')
  rubies.forEach((ruby) => {
    const rt = ruby.querySelector('rt')
    if (rt) {
      if (hidden) {
        // 保留占位，避免页面高度跳动
        rt.style.visibility = 'hidden'
        rt.style.opacity = '0'
        rt.style.pointerEvents = 'none'
      } else {
        rt.style.visibility = ''
        rt.style.opacity = ''
        rt.style.pointerEvents = ''
      }
    }
  })
}

// 执行切换操作
function performSwap() {
  const currentSwapped = getRubySwapped()
  const currentHidden = getRubyHidden()
  setRubySwapped(!currentSwapped)
  swapRubyContentAdvanced()
  // 如果之前是隐藏状态，切换后也要保持隐藏状态
  if (currentHidden) {
    applyRubyHidden(true)
  }
}

// 执行隐藏操作
function performHide() {
  const hidden = getRubyHidden()
  setRubyHidden(!hidden)
  applyRubyHidden(!hidden)
}

export default function RubyControls() {
  useEffect(() => {
    // 应用保存的状态
    const swapped = getRubySwapped()
    const hidden = getRubyHidden()

    setRubySwapped(swapped)
    setRubyHidden(hidden)

    // 如果已交换，应用交换
    if (swapped) {
      // 使用 setTimeout 确保 DOM 已完全加载
      setTimeout(() => {
        swapRubyContentAdvanced()
        // 如果已隐藏，重新应用隐藏状态
        if (hidden) {
          applyRubyHidden(true)
        }
      }, 0)
    } else if (hidden) {
      // 如果已隐藏，应用隐藏
      applyRubyHidden(true)
    }

    // 键盘事件处理器
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在可编辑元素中
      const target = e.target as HTMLElement
      if (!target) return

      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('input, textarea, [contenteditable]')

      if (isEditable) return

      // 直接使用字母快捷键（无修饰键）
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const key = e.key.toLowerCase()

        if (key === 's') {
          e.preventDefault()
          e.stopPropagation()
          performSwap()
          return
        }

        if (key === 'h') {
          e.preventDefault()
          e.stopPropagation()
          performHide()
          return
        }
      }
    }

    // 复制事件处理器 - 过滤掉 rt 标签内容
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      // 获取选中的内容
      const range = selection.getRangeAt(0)
      const container = document.createElement('div')
      container.appendChild(range.cloneContents())

      // 移除所有 rt 标签
      const rtElements = container.querySelectorAll('rt')
      rtElements.forEach((rt) => rt.remove())

      // 获取纯文本（不包含 rt 内容）
      const cleanText = container.textContent || ''

      // 如果有内容，覆盖剪贴板
      if (cleanText) {
        e.preventDefault()
        e.clipboardData?.setData('text/plain', cleanText)
        // 也设置 HTML 版本（移除了 rt 的）
        e.clipboardData?.setData('text/html', container.innerHTML)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('copy', handleCopy, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('copy', handleCopy, true)
    }
  }, [])

  // 这个组件只处理逻辑，不渲染任何UI
  return null
}
