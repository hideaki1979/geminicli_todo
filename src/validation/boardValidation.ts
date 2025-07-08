import { z } from 'zod'

export const taskSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string()
});

export const listSchema = z.object({
    id: z.string(),
    title: z.string(),
    tasks: z.array(taskSchema)
});

export const boardSchema = z.object({
    id: z.string(),
    title: z.string(),
    lists: z.array(listSchema)
})