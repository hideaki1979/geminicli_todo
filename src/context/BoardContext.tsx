'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Board as BoardType, type Task } from '@/types';

interface BoardContextType {
  board: BoardType | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardType | null>>;
  updateBoard: (newBoard: BoardType) => Promise<void>;
  addTask: (listId: string, taskTitle: string) => void;
  editTask: (listId: string, taskId: string, newTitle: string, newContent: string) => void;
  deleteTask: (listId: string, taskId: string) => void;
  editList: (listId: string, newTitle: string) => void;
  deleteList: (listId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children, initialBoard }: { children: ReactNode, initialBoard: BoardType }) => {
  const [board, setBoard] = useState<BoardType | null>(initialBoard);

  const updateBoard = useCallback(async (newBoard: BoardType) => {
    try {
      await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBoard),
      });
    } catch (error) {
      console.error('Failed to save board state', error);
    }
  }, []);

  const addTask = (listId: string, taskTitle: string) => {

    setBoard((prevBoard) => {
      if (!prevBoard) return null;

      const newTask: Task = {
        id: `task-${crypto.randomUUID()}`,
        title: taskTitle,
        content: ''
      };

      const newBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId
            ? { ...list, tasks: [...list.tasks, newTask] }
            : list
        )
      };
      updateBoard(newBoard);
      return newBoard;
    });
  };

  const editTask = (listId: string, taskId: string, newTitle: string, newContent: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      const newBoard = {
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
      updateBoard(newBoard);
      return newBoard;
    });
  };

  const deleteTask = (listId: string, taskId: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      const newBoard = {
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
      updateBoard(newBoard);
      return newBoard;
    });
  };

  const editList = (listId: string, newTitle: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      const newBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId ? { ...list, title: newTitle } : list
        ),
      };
      updateBoard(newBoard);
      return newBoard;
    });
  };

  const deleteList = (listId: string) => {
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      const newBoard = {
        ...prevBoard,
        lists: prevBoard.lists.filter(list => list.id !== listId),
      };
      updateBoard(newBoard);
      return newBoard;
    });
  };

  return (
    <BoardContext.Provider value={{ board, setBoard, updateBoard, addTask, editTask, deleteTask, editList, deleteList }}>
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
