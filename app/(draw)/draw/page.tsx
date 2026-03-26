'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

// Dynamic import for tldraw to avoid SSR issues
const DrawPageWithTldraw = dynamic(
  () => import('@/components/draw/DrawPageWithTldraw').then(mod => ({ default: mod.DrawPageWithTldraw })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
    ssr: false,
  }
)

export default function DrawPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return <DrawPageWithTldraw />
}
