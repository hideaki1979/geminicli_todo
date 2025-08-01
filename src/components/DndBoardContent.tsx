'use client';

import styled from 'styled-components';
import { Task, type List as ListType } from '@/types';
import List from './List';
import Card from './Card';
import { useBoard } from '@/context/BoardContext';
import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import Modal from './Modal';
import useModal from '@/hooks/useModal';
import { ModalActions, Button, Input, ErrorMessage } from '@/components/common/ModalElements';

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

const DndBoardContent = () => {
  const { board, moveTask, addList, loading, error, setError } = useBoard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [listTitle, setListTitle] = useState('');

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

      if (activeId === overId) return;

      // active.data.current can be undefined
      if (!active.data.current) return;

      const { listId: activeListId } = active.data.current as {
        task: Task;
        listId: string;
      };
      moveTask(activeId, overId, activeListId);
    },
  });

  const handleAddList = async (event: React.FormEvent) => {
    event.preventDefault()
    if (listTitle.trim()) {
      await addList(listTitle.trim());
      closeModal();
      setListTitle('')
    }
  };

  const handleOpenModal = () => {
    setError(null)
    openModal()
  }

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
        <AddListButton onClick={handleOpenModal}>
          + リストを追加
        </AddListButton>
      </BoardContainer>

      {isModalOpen && (
        <Modal title='新しいリストを作成' onClose={closeModal}>
          <ModalForm onSubmit={handleAddList}>
            <ModalInput
              type='text'
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder='リストのタイトルを入力'
              autoFocus
              disabled={loading}
            />
            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}

            <ModalActions>
              <ModalButton
                className='secondary'
                type='button'
                onClick={closeModal}
                disabled={loading}
              >
                キャンセル
              </ModalButton>
              <ModalButton className='primary' type='submit'>
                {loading ? 'loading...' : 'リストを追加'}
              </ModalButton>
            </ModalActions>
          </ModalForm>
        </Modal>
      )}

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
