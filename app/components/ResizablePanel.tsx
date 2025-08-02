'use client'

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react'

interface ResizablePanelProps {
  children: ReactNode
  defaultWidth?: string
  defaultHeight?: string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  storageKey?: string
  enableVerticalResize?: boolean
}

export default function ResizablePanel({
  children,
  defaultWidth = '100%',
  defaultHeight = 'auto',
  minWidth = 200,
  minHeight = 150,
  maxWidth,
  maxHeight,
  className = '',
  storageKey,
  enableVerticalResize = false
}: ResizablePanelProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<'width' | 'height' | 'both' | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  // ローカルストレージからサイズを復元
  useEffect(() => {
    if (storageKey) {
      const savedSize = localStorage.getItem(`resizable-panel-${storageKey}`)
      if (savedSize) {
        try {
          const parsed = JSON.parse(savedSize)
          setSize(parsed)
        } catch (error) {
          console.error('Failed to parse saved panel size:', error)
        }
      }
    }
  }, [storageKey])

  // サイズをローカルストレージに保存
  const saveSize = useCallback((newSize: { width: string; height: string }) => {
    if (storageKey) {
      localStorage.setItem(`resizable-panel-${storageKey}`, JSON.stringify(newSize))
    }
  }, [storageKey])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y

    let newWidth = startSize.current.width
    let newHeight = startSize.current.height

    if (resizeDirection === 'width' || resizeDirection === 'both') {
      newWidth = Math.max(minWidth, startSize.current.width + deltaX)
      if (maxWidth) newWidth = Math.min(maxWidth, newWidth)
    }

    if (resizeDirection === 'height' || resizeDirection === 'both') {
      newHeight = Math.max(minHeight, startSize.current.height + deltaY)
      if (maxHeight) newHeight = Math.min(maxHeight, newHeight)
    }

    const newSize = {
      width: resizeDirection === 'width' || resizeDirection === 'both' ? `${newWidth}px` : size.width,
      height: resizeDirection === 'height' || resizeDirection === 'both' ? `${newHeight}px` : size.height
    }

    setSize(newSize)
  }, [isResizing, resizeDirection, minWidth, minHeight, maxWidth, maxHeight, size.width])

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false)
      setResizeDirection(null)
      saveSize(size)
    }
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [isResizing, size, saveSize, handleMouseMove])

  const handleMouseDown = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeDirection(direction)
    
    startPos.current = { x: e.clientX, y: e.clientY }
    
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      startSize.current = { width: rect.width, height: rect.height }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className={`relative border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden ${className}`}
      style={{ width: size.width, height: size.height }}
    >
      <div className="h-full overflow-auto">
        {children}
      </div>
      
      {/* 右端のリサイズハンドル（幅調整） */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 transition-colors group z-10"
        onMouseDown={(e) => handleMouseDown(e, 'width')}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gray-400 dark:bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* 下端のリサイズハンドル（高さ調整） - enableVerticalResizeがtrueの場合のみ表示 */}
      {enableVerticalResize && (
        <div
          className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20 transition-colors group z-10"
          onMouseDown={(e) => handleMouseDown(e, 'height')}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-400 dark:bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}

      {/* 右下角のリサイズハンドル（両方向調整） - enableVerticalResizeがtrueの場合のみ表示 */}
      {enableVerticalResize && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-transparent hover:bg-blue-500/30 transition-colors group z-10"
          onMouseDown={(e) => handleMouseDown(e, 'both')}
        >
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}

      {/* リサイズ中のオーバーレイ */}
      {isResizing && (
        <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }} />
      )}
    </div>
  )
}