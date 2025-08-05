'use client';

import { useState, useEffect } from 'react';
import { Board, List, Task } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- API Communication ---
  const fetchBoard = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const saveBoard = async (updatedBoard: Board) => {
    try {
      await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBoard),
      });
    } catch (err) {
      setError('ボードの保存に失敗しました。');
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  // --- Event Handlers ---
  const handleAddList = (title: string) => {
    if (!board) return;
    const newList: List = {
      id: `list-${Date.now()}`,
      title,
      tasks: [],
    };
    const newBoard = { ...board, lists: [...board.lists, newList] };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleEditList = (listId: string, newTitle: string) => {
    if (!board) return;
    const newLists = board.lists.map(list => 
      list.id === listId ? { ...list, title: newTitle } : list
    );
    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleDeleteList = (listId: string) => {
    if (!board) return;
    const newLists = board.lists.filter(list => list.id !== listId);
    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleAddTask = (listId: string, taskContent: string) => {
    if (!board) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskContent,
      content: '' // 必要に応じて詳細を追加
    };
    const newLists = board.lists.map(list => {
      if (list.id === listId) {
        return { ...list, tasks: [...list.tasks, newTask] };
      }
      return list;
    });
    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleEditTask = (listId: string, taskId: string, newTitle: string, newContent: string) => {
    if (!board) return;
    const newLists = board.lists.map(list => {
      if (list.id === listId) {
        const newTasks = list.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, title: newTitle, content: newContent };
          }
          return task;
        });
        return { ...list, tasks: newTasks };
      }
      return list;
    });
    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleDeleteTask = (listId: string, taskId: string) => {
    if (!board) return;
    const newLists = board.lists.map(list => {
      if (list.id === listId) {
        const newTasks = list.tasks.filter(task => task.id !== taskId);
        return { ...list, tasks: newTasks };
      }
      return list;
    });
    const newBoard = { ...board, lists: newLists };
    setBoard(newBoard);
    saveBoard(newBoard);
  };

  const handleDragEnd = (activeId: string, overId: string | null, activeListId: string) => {
    if (!board || !overId || activeId === overId) return;

    const findList = (listId: string) => board.lists.find(l => l.id === listId);
    const findTask = (taskId: string) => board.lists.flatMap(l => l.tasks).find(t => t.id === taskId);
    const findListByTaskId = (taskId: string) => board.lists.find(l => l.tasks.some(t => t.id === taskId));

    const activeTask = findTask(activeId);
    if (!activeTask) return;

    const sourceList = findListByTaskId(activeId);
    if (!sourceList) return;

    // Is it a task or a list being moved?
    const isTask = activeId.startsWith('task');
    const isList = activeId.startsWith('list');

    let newLists = [...board.lists];

    if (isTask) {
        const overIsTask = overId.startsWith('task');
        const overIsList = overId.startsWith('list');

        const destinationList = overIsList ? findList(overId) : findListByTaskId(overId);
        if (!destinationList) return;

        const activeTaskIndex = sourceList.tasks.findIndex(t => t.id === activeId);
        const [movedTask] = sourceList.tasks.splice(activeTaskIndex, 1);

        if (sourceList.id === destinationList.id) {
            // Moving within the same list
            const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
            destinationList.tasks.splice(overTaskIndex, 0, movedTask);
        } else {
            // Moving to a different list
            if (overIsTask) {
                const overTaskIndex = destinationList.tasks.findIndex(t => t.id === overId);
                destinationList.tasks.splice(overTaskIndex, 0, movedTask);
            } else {
                // Dropping on the list itself
                destinationList.tasks.push(movedTask);
            }
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
    loading, 
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