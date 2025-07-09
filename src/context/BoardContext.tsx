'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Board as BoardType, List, type Task } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

interface BoardContextType {
  board: BoardType | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardType | null>>;
  updateBoard: (newBoard: BoardType) => Promise<void>;
  addTask: (listId: string, taskTitle: string) => Promise<void>;
  editTask: (listId: string, taskId: string, newTitle: string, newContent: string) => Promise<void>;
  deleteTask: (listId: string, taskId: string) => Promise<void>;
  editList: (listId: string, newTitle: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addList: (title: string) => Promise<void>;
  moveTask: (activeId: string, overId: string, activeListId: string) => Promise<void>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children, initialBoard }: { children: ReactNode, initialBoard: BoardType }) => {
  const [board, setBoard] = useState<BoardType | null>(initialBoard);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setError(null);

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
      setError('タスクの追加に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
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

    setLoading(true);
    setError(null);

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
      setError('タスクの編集に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
    }
  };

  const deleteTask = async (listId: string, taskId: string) => {
    const originalBoard = board;
    if (!originalBoard) return;

    setLoading(true);
    setError(null);

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
      setError('タスクの削除に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
    }
  };

  const addList = async (title: string) => {
    const originalBoard = board;
    if (!originalBoard) return;
    setLoading(true);
    setError(null);

    const newList: List = {
      id: `list-${crypto.randomUUID()}`,
      title,
      tasks: []
    };

    const newBoard = {
      ...originalBoard,
      lists: [...originalBoard.lists, newList]
    };
    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('リストの追加に失敗しました：', error);
      setError('リストの追加に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
    }
  };

  const editList = async (listId: string, newTitle: string) => {
    const originalBoard = board;
    if (!originalBoard) return;

    setLoading(true);
    setError(null);

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
      setError('リストの編集に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
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
      setError('リストの削除に失敗しました。')
      setBoard(originalBoard);
    } finally {
      setLoading(false)
    }
  };

  const moveTask = async (activeId: string, overId: string, activeListId: string) => {
    const originalBoard = board;
    if (!originalBoard) return;

    const activeList = originalBoard.lists.find(list => list.id === activeListId);

    const overList = originalBoard.lists.find(list =>
      list.id === overId || list.tasks.some(task => task.id === overId)
    );

    if (!activeList || !overList) return;

    const newBoard = { ...originalBoard };
    const activeListIndex = newBoard.lists.findIndex(l => l.id === activeList.id);
    const overListIndex = newBoard.lists.findIndex(l => l.id === overList.id);

    if (activeList.id === overList.id) {
      const oldIndex = activeList.tasks.findIndex(task => task.id === activeId);
      const newIndex = overList.tasks.findIndex(task => task.id === overId);
      newBoard.lists[activeListIndex].tasks = arrayMove(
        activeList.tasks,
        oldIndex,
        newIndex
      );
    } else {
      const [movedTask] = newBoard.lists[activeListIndex].tasks.splice(
        activeList.tasks.findIndex(task => task.id === activeId),
        1
      );

      const overTaskIndex = overList.tasks.findIndex(
        (task) => task.id === overId
      );

      if (overId === overList.id || overTaskIndex === -1) {
        newBoard.lists[overListIndex].tasks.push(movedTask);
      } else {
        newBoard.lists[overListIndex].tasks.splice(
          overTaskIndex,
          0,
          movedTask
        );
      }
    }
    setBoard(newBoard);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error('タスクの移動に失敗しました：', error);
      setError('タスクの移動に失敗しました。');
      setBoard(originalBoard);
    }
  };

  return (
    <BoardContext.Provider value={{ board, setBoard, updateBoard, addTask, editTask, deleteTask, editList, deleteList, addList, moveTask, error, setError, loading }}>
      {children}
    </BoardContext.Provider>
  );
}

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};
