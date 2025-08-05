import { z } from 'zod';
import { ObjectId } from 'mongodb';

// ObjectIdをZodで検証するためのカスタムスキーマ
const objectIdSchema = z.custom<ObjectId>(
  (val) => ObjectId.isValid(val as string),
  {
    message: "無効なObjectIdです",
  }
);

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
    _id: objectIdSchema.optional(), // APIのレスポンスには含まれるが、リクエスト時にはない場合がある
    userId: objectIdSchema.optional(), // 同上
    title: z.string(),
    lists: z.array(listSchema)
});