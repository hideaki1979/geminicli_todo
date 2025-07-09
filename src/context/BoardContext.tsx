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

  // 共通ヘルパー関数
  const withOptimisticUpdate = async (
    updateFn: (board: BoardType) => BoardType,
    errorMessage: string
  ) => {
    const originalBoard = board;
    if (!originalBoard) return;
    setLoading(true);

    const newBoard = updateFn(originalBoard);
    setBoard(newBoard);
    setError(null);

    try {
      await updateBoard(newBoard);
    } catch (error) {
      console.error(`${errorMessage}：`, error);
      setError(errorMessage);
      setBoard(originalBoard);
    } finally {
      setLoading(false);
    }
  }

  const addTask = async (listId: string, taskTitle: string) => {
    await withOptimisticUpdate(
      (currentBoard) => {
        const newTask: Task = {
          id: `task-${crypto.randomUUID()}`,
          title: taskTitle,
          content: ''
        };

        return {
          ...currentBoard,
          lists: currentBoard.lists.map(list =>
            list.id === listId
              ? { ...list, tasks: [...list.tasks, newTask] }
              : list
          )
        };
      },
      'タスクの追加に失敗しました。'
    );
  };

  const editTask = async (
    listId: string,
    taskId: string,
    newTitle: string,
    newContent: string
  ) => {
    await withOptimisticUpdate(
      (currentBoard) => ({
        ...currentBoard,
        lists: currentBoard.lists.map(list =>
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
      }),
      'タスクの編集に失敗しました'
    );
  };

  const deleteTask = async (listId: string, taskId: string) => {
    await withOptimisticUpdate(
      (currentBoard) => ({
        ...currentBoard,
        lists: currentBoard.lists.map(list =>
          list.id === listId
            ? {
              ...list,
              tasks: list.tasks.filter(task => task.id !== taskId),
            }
            : list
        ),
      }),
      'タスクの削除に失敗しました'
    );
  };

  const addList = async (title: string) => {
    await withOptimisticUpdate(
      (currentBoard) => {
        const newList: List = {
          id: `list-${crypto.randomUUID()}`,
          title,
          tasks: []
        };
        return {
          ...currentBoard,
          lists: [...currentBoard.lists, newList]
        };
      },
      'リストの追加に失敗しました'
    );
  };

  const editList = async (listId: string, newTitle: string) => {
    await withOptimisticUpdate(
      (currentBoard) => ({
        ...currentBoard,
        lists: currentBoard.lists.map(list =>
          list.id === listId ? { ...list, title: newTitle } : list
        ),
      }),
      'リストの編集に失敗しました'
    );
  };

  const deleteList = async (listId: string) => {
    await withOptimisticUpdate(
      (currentBoard) => ({
        ...currentBoard,
        lists: currentBoard.lists.filter(list => list.id !== listId),
      }),
      'リストの削除に失敗しました'
    );
  };

  const moveTask = async (activeId: string, overId: string, activeListId: string) => {
    await withOptimisticUpdate(
      (currentBoard) => {
        const newBoard: BoardType = JSON.parse(JSON.stringify(currentBoard));

        const activeList = newBoard.lists.find(list => list.id === activeListId);
        const overList = newBoard.lists.find(list =>
          list.id === overId || list.tasks.some(task => task.id === overId)
        );

        if (!activeList || !overList) return currentBoard;

        if (activeList.id === overList.id) {
          const oldIndex = activeList.tasks.findIndex(task => task.id === activeId);
          const newIndex = overList.tasks.findIndex(task => task.id === overId);

          if (oldIndex === -1 || newIndex === -1) return currentBoard;

          activeList.tasks = arrayMove(activeList.tasks, oldIndex, newIndex)
        } else {
          const activeTaskIndex = activeList.tasks.findIndex(
            task => task.id === activeId
          );
          if (activeTaskIndex === -1) return currentBoard;

          const [movedTask] = activeList.tasks.splice(
            activeTaskIndex,
            1
          );

          const overTaskIndex = overList.tasks.findIndex(
            (task) => task.id === overId
          );

          if (overId === overList.id || overTaskIndex === -1) {
            overList.tasks.push(movedTask);
          } else {
            overList.tasks.splice(overTaskIndex, 0, movedTask);
          }
        }
        return newBoard;
      },
      'タスクの移動に失敗しました'
    )
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
