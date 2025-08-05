'use client';

import { useState, useEffect, useCallback } from 'react';
import { Board, List, Task } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- API Communication ---
  const fetchBoard = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch('/api/board');
      if (!response.ok) {
        throw new Error('ボードの読み込みに失敗しました。');
      }
      const data = await response.json();
      setBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setInitialLoading(false);
    }
  };

  const saveBoard = useCallback(async (updatedBoard: Board) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBoard),
      });
      if (!response.ok) {
        throw new Error('ボードの保存に失敗しました。');
      }
    } catch {
      setError('ボードの保存に失敗しました。');
      // ここで元の状態に戻すことも検討できる
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  useEffect(() => {
    fetchBoard();
  }, []);

  // --- Event Handlers ---
  const runOptimisticUpdate = (updateFn: (currentBoard: Board) => Board) => {
    if (!board || isSaving) return;
    const newBoard = updateFn(board);
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleAddList = (title: string) => {
    runOptimisticUpdate(currentBoard => {
      const newList: List = {
        id: `list-${crypto.randomUUID()}`,
        title,
        tasks: [],
      };
      return { ...currentBoard, lists: [...currentBoard.lists, newList] };
    });
  };

  const handleEditList = (listId: string, newTitle: string) => {
    runOptimisticUpdate(currentBoard => ({
      ...currentBoard,
      lists: currentBoard.lists.map(list =>
        list.id === listId ? { ...list, title: newTitle } : list
      ),
    }));
  };

  const handleDeleteList = (listId: string) => {
    runOptimisticUpdate(currentBoard => ({
      ...currentBoard,
      lists: currentBoard.lists.filter(list => list.id !== listId),
    }));
  };

  const handleAddTask = (listId: string, taskContent: string) => {
    runOptimisticUpdate(currentBoard => {
      const newTask: Task = {
        id: `task-${crypto.randomUUID()}`,
        title: taskContent,
        content: ''
      };
      return {
        ...currentBoard,
        lists: currentBoard.lists.map(list =>
          list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        ),
      };
    });
  };

  const handleEditTask = (listId: string, taskId: string, newTitle: string, newContent: string) => {
    runOptimisticUpdate(currentBoard => ({
      ...currentBoard,
      lists: currentBoard.lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, title: newTitle, content: newContent } : task
            ),
          };
        }
        return list;
      }),
    }));
  };

  const handleDeleteTask = (listId: string, taskId: string) => {
    runOptimisticUpdate(currentBoard => ({
      ...currentBoard,
      lists: currentBoard.lists.map(list => {
        if (list.id === listId) {
          return { ...list, tasks: list.tasks.filter(task => task.id !== taskId) };
        }
        return list;
      }),
    }));
  };

  const handleDragEnd = (activeId: string, overId: string | null) => {
    if (!board || !overId || activeId === overId || isSaving) return;

    const sourceList = board.lists.find(l => l.tasks.some(t => t.id === activeId));
    if (!sourceList) return;

    let newLists = [...board.lists];
    const isTask = activeId.startsWith('task');
    const isList = activeId.startsWith('list');

    if (isTask) {
      const destinationList = board.lists.find(l => l.id === overId || l.tasks.some(t => t.id === overId));
      if (!destinationList) return;

      const activeTaskIndex = sourceList.tasks.findIndex(t => t.id === activeId);
      const movedTask = sourceList.tasks[activeTaskIndex];
      sourceList.tasks = sourceList.tasks.filter(t => t.id !== activeId);

      if (sourceList.id === destinationList.id) {
        const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
        destinationList.tasks.splice(overTaskIndex, 0, movedTask);
      } else {
        const overIsTask = overId.startsWith('task');
        const overTaskIndex = overIsTask ? destinationList.tasks.findIndex(t => t.id === overId) : destinationList.tasks.length;
        destinationList.tasks.splice(overTaskIndex, 0, movedTask);
      }
    } else if (isList) {
      const activeListIndex = newLists.findIndex(l => l.id === activeId);
      const overListIndex = newLists.findIndex(l => l.id === overId);
      newLists = arrayMove(newLists, activeListIndex, overListIndex);
    }

    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  return {
    board,
    initialLoading,
    isSaving,
    error,
    setError,
    handleAddList,
    handleEditList,
    handleDeleteList,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleDragEnd
  };
}
