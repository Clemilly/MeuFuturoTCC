"use client"

import VLibras from '@djpfs/react-vlibras'

interface VLibrasWidgetProps {
  forceOnload?: boolean
  avatar?: 'icaro' | 'hosana' | 'guga'
  position?: 'br' | 'bl' | 'tr' | 'tl'
  opacity?: number
}

export function VLibrasWidget({ 
  forceOnload = true,
  avatar = 'icaro',
  position = 'br',
  opacity = 1.0
}: VLibrasWidgetProps) {
  return (
    <VLibras 
      forceOnload={forceOnload}
      avatar={avatar}
      position={position}
      opacity={opacity}
    />
  )
}