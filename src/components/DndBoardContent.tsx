'use client';

import styled from 'styled-components';
import { type List as ListType } from '@/types';
import List from './List';
import Card from './Card';
import { useBoard } from '@/context/BoardContext';
import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { useState } from 'react';

const BoardContainer = styled.div`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
`;

const AddListButton = styled.button`
  background-color: #ebecf0;
  color: #8c8c8c;
  border: none;
  border-radius: 3px;
  padding: 8px 12px;
  cursor: pointer;
  width: 272px;
  margin-left: 8px;
  flex-shrink: 0;

  &:hover {
    background-color: #dadce0;
  }
`;

const DndBoardContent = () => {
  const { board, setBoard } = useBoard();
  const [activeId, setActiveId] = useState<string | null>(null);

  useDndMonitor({
    onDragStart: (event) => {
      setActiveId(String(event.active.id));
    },
    onDragEnd: (event) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over || !board) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // active.data.current can be undefined
      if (!active.data.current) return;

      const { listId: activeListId } = active.data.current as {
        task: ListType;
        listId: string;
      };

      // Find the list where the active item is located
      const activeList = board.lists.find(list => list.id === activeListId);

      // Find the list where the over item (or list itself) is located
      const overList = board.lists.find(list =>
        list.id === overId || list.tasks.some(task => task.id === overId)
      );

      if (!activeList || !overList) return;

      const newBoard = { ...board };
      const activeListIndex = newBoard.lists.findIndex(l => l.id === activeList.id);
      const overListIndex = newBoard.lists.findIndex(l => l.id === overList.id);

      if (activeList.id === overList.id) {
        // Moving within the same list
        const oldIndex = activeList.tasks.findIndex(task => task.id === activeId);
        const newIndex = overList.tasks.findIndex(task => task.id === overId);
        newBoard.lists[activeListIndex].tasks = arrayMove(
          activeList.tasks,
          oldIndex,
          newIndex
        );
      } else {
        // Different list
        const [movedTask] = newBoard.lists[activeListIndex].tasks.splice(
          activeList.tasks.findIndex(task => task.id === activeId),
          1
        );

        const overTaskIndex = overList.tasks.findIndex(
          (task) => task.id === overId
        );

        if (overId === overList.id || overTaskIndex === -1) {
          // dropping on the list
          newBoard.lists[overListIndex].tasks.push(movedTask);
        } else {
          // dropping on a task
          newBoard.lists[overListIndex].tasks.splice(
            overTaskIndex,
            0,
            movedTask
          );
        }
      }
      setBoard(newBoard);
    },
  });

  const handleAddList = () => {
    const listTitle = prompt('Enter a title for this list:');
    if (listTitle) {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;
        const newList: ListType = {
          id: `list-${crypto.randomUUID()}`,
          title: listTitle,
          tasks: [],
        };
        return {
          ...prevBoard,
          lists: [...prevBoard.lists, newList],
        };
      });
    }
  };

  const activeTask = activeId
    ? board?.lists.flatMap(list => list.tasks).find(task => task.id === activeId)
    : null;

  const activeList = activeTask && board
    ? board.lists.find(list => list.tasks.some(task => task.id === activeTask.id))
    : null;

  if (!board) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <BoardContainer>
        {board.lists.map((list: ListType) => (
          <List key={list.id} list={list} />
        ))}
        <AddListButton onClick={handleAddList}>+ リストを追加</AddListButton>
      </BoardContainer>

      {createPortal(
        <DragOverlay>
          {activeTask && activeList ? <Card task={activeTask} listId={activeList.id} /> : null}
        </DragOverlay>,
        document.body
      )}
    </>
  );
};

export default DndBoardContent;
