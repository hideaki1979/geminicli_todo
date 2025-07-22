'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Task as TaskType } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoard } from '@/context/BoardContext';
import Modal from './Modal';
import useModal from '@/hooks/useModal';
import { ModalActions, Button, Input } from '@/components/common/ModalElements';

const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #f4f5f7;
  }
`;

const CardContent = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

const CardTitle = styled.span`
  flex-grow: 1;
`;

const CardActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b778c;

  &:hover {
    color: #172b4d;
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  padding: 4px;
  margin-right: 8px;
  color: #6b778c;

  &:hover {
    color: #172b4d;
  }
`;

interface CardProps {
  task: TaskType;
  listId: string;
}

const Card = ({ task, listId }: CardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: {
      task,
      listId,
    },
  });
  const { editTask, deleteTask, loading } = useBoard();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [newTitle, setNewTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      editTask(listId, task.id, newTitle, task.content);
      closeEditModal();
    }
  };

  const handleDeleteConfirm = () => {
    deleteTask(listId, task.id);
    closeDeleteModal();
  };

  return (
    <>
      <CardContainer ref={setNodeRef} style={style} {...attributes}>
        <CardContent>
          <DragHandle {...listeners}>⠿</DragHandle>
          <CardTitle>{task.title}</CardTitle>
        </CardContent>
        <CardActions>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              openEditModal();
            }}
            aria-label='タスクを編集'
          >
            ✏️
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal();
            }}
            aria-label='タスクを削除'
          >
            🗑️
          </ActionButton>
        </CardActions>
      </CardContainer>

      {isEditModalOpen && (
        <Modal title='タスクを編集' onClose={closeEditModal}>
          <form onSubmit={handleEditSubmit}>
            <Input
              type='text'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <ModalActions>
              <Button
                className='secondary'
                type='button'
                onClick={closeEditModal}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                className='primary'
                type='submit'
                disabled={loading}
              >
                保存
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal title='タスクを削除' onClose={closeDeleteModal}>
          <p>本当にこのタスクを削除しますか？</p>
          <p>
            <strong>{task.title}</strong>
          </p>
          <ModalActions>
            <Button
              className='secondary'
              onClick={closeDeleteModal}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              className='primary'
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              削除
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  );
};

export default Card;
