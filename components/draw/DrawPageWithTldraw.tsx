'use client'

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { ERDToolbar } from './ERDToolbar'

export function DrawPageWithTldraw() {
  return (
    <div className="w-full h-screen">
      <Tldraw persistenceKey="zinaplus-erd-diagram">
        <ERDToolbar />
      </Tldraw>
    </div>
  )
}
