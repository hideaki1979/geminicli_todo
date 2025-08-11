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
      const response = await fetch('/api/board/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lists: updatedBoard.lists }),
      });
      if (!response.ok) {
        throw new Error('ボードの並び順の保存に失敗しました。');
      }
    } catch {
      setError('ボードの並び順の保存に失敗しました。');
      // ここで元の状態に戻すことも検討できる
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  useEffect(() => {
    fetchBoard();
  }, []);

  // --- Event Handlers ---

  const handleAddList = async (title: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const newList: List = {
      id: `list-${crypto.randomUUID()}`,
      title,
      tasks: [],
    };

    // Optimistic update
    setBoard(prevBoard => prevBoard ? { ...prevBoard, lists: [...prevBoard.lists, newList] } : null);

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });

      if (!response.ok) {
        throw new Error('リストの追加に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(prevBoard => prevBoard ? { ...prevBoard, lists: prevBoard.lists.filter(list => list.id !== newList.id) } : null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditList = async (listId: string, newTitle: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const originalBoard = board; // Rollback用

    // Optimistic update
    setBoard(prevBoard => prevBoard ? {
      ...prevBoard,
      lists: prevBoard.lists.map(list =>
        list.id === listId ? { ...list, title: newTitle } : list
      ),
    } : null);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('リストの更新に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(originalBoard);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const originalBoard = board; // Rollback用

    // Optimistic update
    setBoard(prevBoard => prevBoard ? {
      ...prevBoard,
      lists: prevBoard.lists.filter(list => list.id !== listId),
    } : null);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('リストの削除に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(originalBoard);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async (listId: string, taskContent: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const newTask: Task = {
      id: `task-${crypto.randomUUID()}`,
      title: taskContent,
      content: ''
    };

    // Optimistic update
    setBoard(prevBoard => prevBoard ? {
      ...prevBoard,
      lists: prevBoard.lists.map(list =>
        list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
      ),
    } : null);

    try {
      const response = await fetch(`/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('タスクの追加に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(prevBoard => prevBoard ? {
        ...prevBoard,
        lists: prevBoard.lists.map(list =>
          list.id === listId ? { ...list, tasks: list.tasks.filter(task => task.id !== newTask.id) } : list
        ),
      } : null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTask = async (listId: string, taskId: string, newTitle: string, newContent: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const originalBoard = board; // Rollback用

    // Optimistic update
    setBoard(prevBoard => prevBoard ? {
      ...prevBoard,
      lists: prevBoard.lists.map(list => {
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
    } : null);

    try {
      const response = await fetch(`/api/cards/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, listId }),
      });

      if (!response.ok) {
        throw new Error('タスクの更新に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(originalBoard);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (listId: string, taskId: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const originalBoard = board; // Rollback用

    // Optimistic update
    setBoard(prevBoard => prevBoard ? {
      ...prevBoard,
      lists: prevBoard.lists.map(list => {
        if (list.id === listId) {
          return { ...list, tasks: list.tasks.filter(task => task.id !== taskId) };
        }
        return list;
      }),
    } : null);

    try {
      const response = await fetch(`/api/cards/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }, // DELETEでもbodyを送るために必要
        body: JSON.stringify({ listId }), // listIdをbodyで送る
      });

      if (!response.ok) {
        throw new Error('タスクの削除に失敗しました。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      // Rollback optimistic update
      setBoard(originalBoard);
    } finally {
      setIsSaving(false);
    }
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
        // 同一リスト内の並び替えは、対象カードの「後ろ」に挿入する
        const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
        const insertIndex = overTaskIndex + 1;
        destinationList.tasks.splice(insertIndex, 0, movedTask);
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
