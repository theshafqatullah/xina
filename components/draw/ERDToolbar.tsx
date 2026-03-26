'use client'

import { useEditor } from 'tldraw'
import { Save, Share2, RotateCcw, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ERDToolbar() {
  const editor = useEditor()

  const handleExport = () => {
    if (!editor) return
    
    try {
      const snapshot = editor.getSnapshot()
      const dataStr = JSON.stringify(snapshot, null, 2)
      
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr))
      element.setAttribute('download', `erd-${Date.now()}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (error) {
      console.error('Failed to export ERD:', error)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file || !editor) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const snapshot = JSON.parse(event.target.result)
          editor.loadSnapshot(snapshot)
        } catch (error) {
          console.error('Failed to import ERD:', error)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleReset = () => {
    if (editor && confirm('Are you sure you want to clear the canvas?')) {
      // Clear all shapes on current page
      const currentPageId = editor.getCurrentPageId()
      const shapeIds = Array.from(editor.getPageShapeIds(currentPageId))
      if (shapeIds.length > 0) {
        editor.deleteShapes(shapeIds)
      }
    }
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-gray-800/95 rounded-lg shadow-xl p-3 flex flex-col gap-2 backdrop-blur-sm">
      <div className="text-xs font-semibold text-gray-100 uppercase tracking-wide flex items-center gap-2">
        <Database className="w-4 h-4" />
        ERD Tools
      </div>

      <div className="border-t border-gray-700 pt-2 flex flex-col gap-2">
        <Button
          onClick={handleExport}
          size="sm"
          className="flex items-center gap-2 w-full justify-start text-xs"
          variant="outline"
        >
          <Save className="w-4 h-4" />
          Export Diagram
        </Button>

        <Button
          onClick={handleImport}
          size="sm"
          className="flex items-center gap-2 w-full justify-start text-xs"
          variant="outline"
        >
          <Share2 className="w-4 h-4" />
          Import Diagram
        </Button>

        <Button
          onClick={handleReset}
          size="sm"
          className="flex items-center gap-2 w-full justify-start text-xs text-red-400 hover:text-red-300"
          variant="outline"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Canvas
        </Button>
      </div>

      <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
        <p className="text-[11px]">✓ Auto-saved to browser</p>
      </div>
    </div>
  )
}
