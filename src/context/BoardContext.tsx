'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Board as BoardType, type Task } from '@/types';

interface BoardContextType {
  board: BoardType | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardType | null>>;
  updateBoard: (newBoard: BoardType) => Promise<void>;
  addTask: (listId: string, taskTitle: string) => Promise<void>;
  editTask: (listId: string, taskId: string, newTitle: string, newContent: string) => Promise<void>;
  deleteTask: (listId: string, taskId: string) => Promise<void>;
  editList: (listId: string, newTitle: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children, initialBoard }: { children: ReactNode, initialBoard: BoardType }) => {
  const [board, setBoard] = useState<BoardType | null>(initialBoard);

  const updateBoard = useCallback(async (newBoard: BoardType) => {
    const response = await fetch('/api/board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBoard),
    });
    if (!response.ok) {
      throw new Error('ボードの保存に失敗しました');
    }
  }, []);

  const addTask = async (listId: string, taskTitle: string) => {
    const originalBoard = board;
    if (!originalBoard) return;

    const newTask: Task = {
      id: `task-${crypto.randomUUID()}`,
      title: taskTitle,
      content: ''
    };

    const newBoard = {
      ...originalBoard,
      lists: originalBoard.lists.map(list =>
        list.id === listId
          ? { ...list, tasks: [...list.tasks, newTask] }
          : list
      )
    };
    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('タスクの追加に失敗しました：', error);
      setBoard(originalBoard);
    }

  };

  const editTask = async (
    listId: string,
    taskId: string,
    newTitle: string,
    newContent: string
  ) => {

    const originalBoard = board;
    if (!originalBoard) return;

    const newBoard = {
      ...originalBoard,
      lists: originalBoard.lists.map(list =>
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
    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('タスクの編集に失敗しました：', error);
      setBoard(originalBoard);
    }
  };

  const deleteTask = async (listId: string, taskId: string) => {
    const originalBoard = board;
    if (!originalBoard) return;
    const newBoard = {
      ...originalBoard,
      lists: originalBoard.lists.map(list =>
        list.id === listId
          ? {
            ...list,
            tasks: list.tasks.filter(task => task.id !== taskId),
          }
          : list
      ),
    };
    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('タスクの削除に失敗しました：', error);
      setBoard(originalBoard);
    }
  };

  const editList = async (listId: string, newTitle: string) => {
    const originalBoard = board;
    if (!originalBoard) return;
    const newBoard = {
      ...originalBoard,
      lists: originalBoard.lists.map(list =>
        list.id === listId ? { ...list, title: newTitle } : list
      ),
    };

    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('リストの編集に失敗しました：', error);
      setBoard(originalBoard);
    }
  };

  const deleteList = async (listId: string) => {
    const originalBoard = board;
    if (!originalBoard) return;
    const newBoard = {
      ...originalBoard,
      lists: originalBoard.lists.filter(list => list.id !== listId),
    };

    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('リストの削除に失敗しました：', error);
      setBoard(originalBoard);
    }
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


