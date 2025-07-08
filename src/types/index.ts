export type Task = {
  id: string;
  title: string;
  content: string;
};

export type List = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Board = {
  id: string;
  title: string;
  lists: List[];
};
