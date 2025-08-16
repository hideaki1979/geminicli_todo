import { ObjectId } from 'mongodb';

export type Task = {
  id: string;
  title: string;
  content?: string;
};

export type List = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Board = {
  _id: ObjectId; // MongoDBのドキュメントID
  userId: ObjectId; // ユーザーのID
  title: string;
  lists: List[];
};

export type User = {
  _id: ObjectId;
  name?: string | null;
  email?: string | null;
  password: string;
  emailVerified?: Date | null;
  image?: string | null;
};