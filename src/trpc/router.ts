import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from './init'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new domain' },
  { id: 3, name: 'Finish the project' }
]

const TodoAddSchema = z.object({ name: z.string() })

function defineTodosRouter() {
  return {
    list: publicProcedure.query(() => todos),
    add: protectedProcedure.input(TodoAddSchema).mutation(({ input, ctx }) => {
      const newTodo = {
        id: todos.length + 1,
        name: input.name,
        userId: ctx.session.user.id
      }
      todos.push(newTodo)
      return newTodo
    })
  }
}

export const trpcRouter = createTRPCRouter({
  todos: defineTodosRouter()
})

export type TRPCRouter = typeof trpcRouter
