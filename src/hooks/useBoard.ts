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

    const reorderData = {
      lists: updatedBoard.lists.map(list => ({
        id: list.id,
        taskIds: list.tasks.map(task => task.id),
      })),
    };

    try {
      const response = await fetch('/api/board/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData),
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

  const handleAddTask = async (listId: string, taskTitle: string) => {
    if (!board || isSaving) return;
    setIsSaving(true);

    const newTask: Task = {
      id: `task-${crypto.randomUUID()}`,
      title: taskTitle,
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

    setBoard(prevBoard => {
      if (!prevBoard) return null;

      // --- Moving a List ---
      if (activeId.startsWith('list-')) {
        if (!overId.startsWith('list-')) return prevBoard;
        const oldIndex = prevBoard.lists.findIndex(list => list.id === activeId);
        const newIndex = prevBoard.lists.findIndex(list => list.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prevBoard;

        const newLists = arrayMove(prevBoard.lists, oldIndex, newIndex);
        const newBoard = { ...prevBoard, lists: newLists };
        saveBoard(newBoard);
        return newBoard;
      }

      // --- Moving a Task ---
      if (activeId.startsWith('task-')) {
        const sourceList = prevBoard.lists.find(list => list.tasks.some(task => task.id === activeId));
        const destinationList = prevBoard.lists.find(list => list.id === overId || list.tasks.some(task => task.id === overId));

        if (!sourceList || !destinationList) return prevBoard;

        const movedTask = sourceList.tasks.find(task => task.id === activeId);
        if (!movedTask) return prevBoard;

        let newLists;

        if (sourceList.id === destinationList.id) {
          // Same list movement: Use arrayMove for simplicity and correctness
          const oldTaskIndex = sourceList.tasks.findIndex(t => t.id === activeId);
          const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
          if (oldTaskIndex === -1) return prevBoard;

          // If dropping on the list container, move to the end.
          const newTaskIndex = overTaskIndex !== -1 ? overTaskIndex : destinationList.tasks.length - 1;
          const reorderedTasks = arrayMove(sourceList.tasks, oldTaskIndex, newTaskIndex);
          newLists = prevBoard.lists.map(list =>
            list.id === sourceList.id ? { ...list, tasks: reorderedTasks } : list
          );
        } else {
          // Cross-list movement
          const sourceTasks = sourceList.tasks.filter(t => t.id !== activeId);
          const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
          const destTasks = [...destinationList.tasks];

          // If dropping on a task, insert before it. If dropping on the list container, append to the end.
          const insertIndex = overTaskIndex !== -1 ? overTaskIndex : destTasks.length;
          destTasks.splice(insertIndex, 0, movedTask);

          newLists = prevBoard.lists.map(list => {
            if (list.id === sourceList.id) return { ...list, tasks: sourceTasks };
            if (list.id === destinationList.id) return { ...list, tasks: destTasks };
            return list;
          });
        }

        const newBoard = { ...prevBoard, lists: newLists };
        saveBoard(newBoard);
        return newBoard;
      }

      return prevBoard;
    });
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
