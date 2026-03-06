import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useTRPC } from '#/trpc/react'

export const Route = createFileRoute('/demo/trpc-todo')({
  component: TRPCTodos,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(context.trpc.todos.list.queryOptions())
  }
})

function TRPCTodos() {
  const trpc = useTRPC()
  const { data = [], refetch } = useQuery(trpc.todos.list.queryOptions())

  const [todo, setTodo] = useState('')
  const { mutate: addTodo } = useMutation({
    ...trpc.todos.add.mutationOptions(),
    onSuccess: () => {
      refetch()
      setTodo('')
    },
    onError: (error) => {
      console.warn(error.message)
    }
  })

  const submitTodo = useCallback(() => {
    addTodo({ name: todo })
  }, [addTodo, todo])

  return (
    <div className='bg-background-page flex min-h-screen items-center justify-center p-4'>
      <div className='border-sidebar-border/10 bg-sidebar/50 w-full max-w-2xl rounded-xl border-8 p-8 shadow-lg backdrop-blur-md'>
        <h1 className='text-sidebar-foreground mb-4 text-2xl'>tRPC Todos list</h1>
        <ul className='mb-4 space-y-2'>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((t: { id: number; name: string }) => (
              <li
                key={t.id}
                className='border-sidebar/30 bg-sidebar/20 rounded-lg border p-3 shadow backdrop-blur-sm'
              >
                <span className='text-sidebar-foreground text-lg'>{t.name}</span>
              </li>
            ))
          ) : (
            <li className='text-on-background-neutral'>No todos found.</li>
          )}
        </ul>
        <div className='flex flex-col gap-2'>
          <input
            type='text'
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitTodo()
              }
            }}
            placeholder='Enter a new todo...'
            className='border-sidebar/30 bg-sidebar/20 text-sidebar-foreground placeholder-on-background-neutral focus:ring-border-primary w-full rounded-lg border px-4 py-3 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:outline-none'
          />
          <button
            type='button'
            disabled={todo.trim().length === 0}
            onClick={submitTodo}
            className='bg-background-primary text-on-brand hover:bg-background-primary/80 disabled:bg-background-primary/50 rounded-lg px-4 py-3 font-bold transition-colors disabled:cursor-not-allowed'
          >
            Add todo
          </button>
        </div>
      </div>
    </div>
  )
}
