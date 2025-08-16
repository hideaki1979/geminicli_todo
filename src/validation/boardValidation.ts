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
    content: z.string().optional(),
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

// APIリクエスト用のバリデーションスキーマ
export const createListSchema = listSchema.omit({ tasks: true });
export const updateListSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
});

// 生成時: id, title は必要。content は任意。
export const createCardSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string().optional()
});

// 更新時: idはパスパラで受ける前提。bodyには含めない。
export const updateCardSchema = z.object({
    title: z.string(),
    content: z.string().optional(),
    listId: z.string(),
});

export const reorderBoardSchema = z.object({
    lists: z.array(z.object({
        id: z.string(),
        taskIds: z.array(z.string())
    }))
});
