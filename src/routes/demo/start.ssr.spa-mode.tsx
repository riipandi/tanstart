import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getPunkSongs } from '#/data/demo.punk-songs'

type PunkSong = { id: number; name: string; artist: string }

export const Route = createFileRoute('/demo/start/ssr/spa-mode')({
  ssr: false,
  component: RouteComponent
})

function RouteComponent() {
  const [punkSongs, setPunkSongs] = useState<PunkSong[]>([])

  useEffect(() => {
    getPunkSongs().then(setPunkSongs)
  }, [])

  return (
    <div className='bg-background-page flex min-h-screen items-center justify-center p-4'>
      <div className='border-sidebar-border/10 bg-sidebar/50 w-full max-w-2xl rounded-xl border-8 p-8 shadow-xl backdrop-blur-md'>
        <h1 className='text-sidebar-primary mb-6 text-3xl font-bold'>SPA Mode - Punk Songs</h1>
        <ul className='space-y-3'>
          {punkSongs.map((song) => (
            <li
              key={song.id}
              className='border-sidebar/30 bg-sidebar/20 rounded-lg border p-4 shadow-md backdrop-blur-sm'
            >
              <span className='text-sidebar-foreground text-lg font-medium'>{song.name}</span>
              <span className='text-on-background-neutral'> - {song.artist}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
