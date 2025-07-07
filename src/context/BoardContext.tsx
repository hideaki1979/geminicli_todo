'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Board as BoardType, type Task } from '@/types';

interface BoardContextType {
  board: BoardType | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardType | null>>;
  addTask: (listId: string, taskTitle: string) => void;
  editTask: (listId: string, taskId: string, newTitle: string, newContent: string) => void;
  deleteTask: (listId: string, taskId: string) => void;
  editList: (listId: string, newTitle: string) => void;
  deleteList: (listId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children, initialBoard }: { children: ReactNode, initialBoard: BoardType }) => {
  const [board, setBoard] = useState<BoardType | null>(initialBoard);

  const addTask = (listId: string, taskTitle: string) => {

    setBoard((prevBoard) => {
      if (!prevBoard) return null;

      const newTask: Task = {
        id: `task-${crypto.randomUUID()}`,
        title: taskTitle,
        content: ''
      };

      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId
            ? { ...list, tasks: [...list.tasks, newTask] }
            : list
        )
      };
    });
  };

  const editTask = (listId: string, taskId: string, newTitle: string, newContent: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId
            ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? { ...task, title: newTitle, content: newContent }
                  : task
              ),
            }
            : list
        ),
      };
    });
  };

  const deleteTask = (listId: string, taskId: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId
            ? {
              ...list,
              tasks: list.tasks.filter(task => task.id !== taskId),
            }
            : list
        ),
      };
    });
  };

  const editList = (listId: string, newTitle: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId ? { ...list, title: newTitle } : list
        ),
      };
    });
  };

  const deleteList = (listId: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        lists: prevBoard.lists.filter(list => list.id !== listId),
      };
    });
  };

  return (
    <BoardContext.Provider value={{ board, setBoard, addTask, editTask, deleteTask, editList, deleteList }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};
