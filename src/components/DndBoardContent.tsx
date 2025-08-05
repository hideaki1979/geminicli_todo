'use client';

import styled from 'styled-components';
import { type List as ListType } from '@/types';
import List from './List';
import Card from './Card';
import { useBoard } from '@/hooks/useBoard'; // Contextからカスタムフックに変更
import { DragOverlay, DndContext, closestCorners, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import Modal from './Modal';
import useModal from '@/hooks/useModal';
import { ModalActions, Button, Input, ErrorMessage } from '@/components/common/ModalElements';

// --- Styled Components (変更なし) ---
const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const ModalInput = styled(Input)`
  margin-bottom: 12px;
`;

const ModalButton = styled(Button)`
  &.primary {
    background-color: #5aac44;

    &:hover {
      background-color: #61c555;
    }
  }
`;

const BoardContainer = styled.div`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  gap: 8px;
`;

const AddListButton = styled.button`
  background-color: #ebecf0;
  color: #8c8c8c;
  border: none;
  border-radius: 3px;
  padding: 8px 12px;
  cursor: pointer;
  width: 272px;
  flex-shrink: 0;

  &:hover {
    background-color: #dadce0;
  }
`;

// --- Component --- 
const DndBoardContent = () => {
  const {
    board,
    initialLoading,
    isSaving,
    error: boardError,
    setError,
    handleAddList,
    handleEditList,
    handleDeleteList,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleDragEnd
  } = useBoard();

  const [activeId, setActiveId] = useState<string | null>(null);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [listTitle, setListTitle] = useState('');

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    handleDragEnd(String(active.id), String(over.id));
  };

  const onAddListSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (listTitle.trim()) {
      handleAddList(listTitle.trim());
      closeModal();
      setListTitle('');
    }
  };

  const handleOpenModal = () => {
    setError(null);
    openModal();
  };

  const activeTask = activeId && board
    ? board.lists.flatMap(list => list.tasks).find(task => task.id === activeId)
    : null;

  const activeList = activeTask && board
    ? board.lists.find(list => list.tasks.some(task => task.id === activeTask.id))
    : null;

  if (initialLoading) {
    return <div>Loading Board...</div>;
  }

  if (boardError) {
    return <div>Error: {boardError}</div>
  }

  if (!board) {
    return <div>Board not found.</div>
  }

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetection={closestCorners}>
      <BoardContainer>
        {board.lists.map((list: ListType) => (
          <List
            key={list.id}
            list={list}
            isSaving={isSaving}
            onAddTask={handleAddTask}
            onEditList={handleEditList}
            onDeleteList={handleDeleteList}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
        <AddListButton onClick={handleOpenModal}>
          + リストを追加
        </AddListButton>
      </BoardContainer>

      {isModalOpen && (
        <Modal title='新しいリストを作成' onClose={closeModal}>
          <ModalForm onSubmit={onAddListSubmit}>
            <ModalInput
              type='text'
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder='リストのタイトルを入力'
              autoFocus
              disabled={isSaving}
            />
            {boardError && (
              <ErrorMessage>{boardError}</ErrorMessage>
            )}
            <ModalActions>
              <ModalButton
                className='secondary'
                type='button'
                onClick={closeModal}
              >
                キャンセル
              </ModalButton>
              <ModalButton className='primary' type='submit' disabled={isSaving}>
                リストを追加
              </ModalButton>
            </ModalActions>
          </ModalForm>
        </Modal>
      )}

      {createPortal(
        <DragOverlay>
          {activeTask && activeList ? (
            <Card
              task={activeTask}
              listId={activeList.id}
              isSaving={isSaving}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default DndBoardContent;