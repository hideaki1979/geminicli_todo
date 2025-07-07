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
    if (!board) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      content: ''
    };

    const newBoard = { ...board };
    const listIndex = newBoard.lists.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
      const newList = { ...newBoard.lists[listIndex] };
      newList.tasks = [...newList.tasks, newTask];
      newBoard.lists = [
        ...newBoard.lists.slice(0, listIndex),
        newList,
        ...newBoard.lists.slice(listIndex + 1),
      ];
      setBoard(newBoard);
    }
  };

  const editTask = (listId: string, taskId: string, newTitle: string, newContent: string) => {
    if (!board) return;

    const newBoard = { ...board };
    const listIndex = newBoard.lists.findIndex(list => list.id === listId);

    if (listIndex !== -1) {
      const newList = { ...newBoard.lists[listIndex] };
      const taskIndex = newList.tasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        const newTasks = [...newList.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], title: newTitle, content: newContent };
        newList.tasks = newTasks;

        newBoard.lists = [
          ...newBoard.lists.slice(0, listIndex),
          newList,
          ...newBoard.lists.slice(listIndex + 1),
        ];
        setBoard(newBoard);
      }
    }
  };

  const deleteTask = (listId: string, taskId: string) => {
    if (!board) return;

    const newBoard = { ...board };
    const listIndex = newBoard.lists.findIndex(list => list.id === listId);

    if (listIndex !== -1) {
      const newList = { ...newBoard.lists[listIndex] };
      const initialTaskCount = newList.tasks.length;
      newList.tasks = newList.tasks.filter(task => task.id !== taskId);

      if (newList.tasks.length < initialTaskCount) {
        newBoard.lists = [
          ...newBoard.lists.slice(0, listIndex),
          newList,
          ...newBoard.lists.slice(listIndex + 1),
        ];
        setBoard(newBoard);
      }
    }
  };

  const editList = (listId: string, newTitle: string) => {
    if (!board) return;

    const newBoard = { ...board };
    const listIndex = newBoard.lists.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
      const newList = { ...newBoard.lists[listIndex], title: newTitle };
      newBoard.lists = [
        ...newBoard.lists.slice(0, listIndex),
        newList,
        ...newBoard.lists.slice(listIndex + 1),
      ];
      setBoard(newBoard);
    }
  };

  const deleteList = (listId: string) => {
    if (!board) return;

    const newBoard = { ...board };
    const initialListCount = newBoard.lists.length;
    newBoard.lists = newBoard.lists.filter(list => list.id !== listId);
    if (newBoard.lists.length < initialListCount) {
      setBoard(newBoard);
    }
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
