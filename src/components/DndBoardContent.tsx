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

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`

const ModalInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-bottom: 12px;
  font-size: 14px;
`;

const ModalButton = styled.button`
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;

  &.primary {
    background-color: #5aac44;
    color: white;

    &:hover {
      background-color: #61c555;
    }
  }

  &.secondary {
    background-color: #f4f5f7;
    color: #172b4d;
    &:hover {
      background-color: #e1e4e8;
    }
  }
`;

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

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin-top: -4px;
  margin-bottom: 8px;
`;

const DndBoardContent = () => {
  const { board, moveTask, addList, loading, error, setError } = useBoard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
      setListTitle('')
    }
  };

  const openModal = () => {
    setError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
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
        <AddListButton onClick={openModal}>
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
