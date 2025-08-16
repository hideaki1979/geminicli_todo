'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Task as TaskType } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from './Modal';
import useModal from '@/hooks/useModal';
import { ModalActions, Button, Input, Textarea } from '@/components/common/ModalElements';

// --- Styled Components ---
const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column; /* To stack title and content */
  align-items: flex-start; /* Align items to the start */

  &:hover {
    background-color: #f4f5f7;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CardBody = styled.div`
  width: 100%;
  margin-top: 8px;
`;

const CardTitle = styled.span`
  flex-grow: 1;
`;

const CardDescription = styled.p`
  font-size: 12px;
  color: #5e6c84;
  margin: 0;
  white-space: pre-wrap; /* To respect newlines */
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

// --- Props Interface ---
interface CardProps {
  task: TaskType;
  listId: string;
  onEditTask: (listId: string, taskId: string, newTitle: string, newContent: string) => void;
  onDeleteTask: (listId: string, taskId: string) => void;
  isSaving: boolean;
}

// --- Component ---
const Card = ({ task, listId, onEditTask, onDeleteTask, isSaving }: CardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { task, listId },
  });
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [newTitle, setNewTitle] = useState(task.title);
  const [newContent, setNewContent] = useState(task.content || '');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onEditTask(listId, task.id, newTitle, newContent);
      closeEditModal();
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteTask(listId, task.id);
    closeDeleteModal();
  };

  return (
    <>
      <CardContainer ref={setNodeRef} style={style} {...attributes} data-testid={`card-${task.title}`}>
        <CardHeader>
          <DragHandle {...listeners} data-testid="drag-handle">⠿</DragHandle>
          <CardTitle data-testid="card-title">{task.title}</CardTitle>
          <CardActions>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                openEditModal();
              }}
              aria-label='タスクを編集'
              data-testid="edit-card-button"
            >
              ✏️
            </ActionButton>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal();
              }}
              aria-label='タスクを削除'
              data-testid="delete-card-button"
            >
              🗑️
            </ActionButton>
          </CardActions>
        </CardHeader>
        {task.content && (
          <CardBody>
            <CardDescription data-testid="card-content">{task.content}</CardDescription>
          </CardBody>
        )}
      </CardContainer>

      {isEditModalOpen && (
        <Modal title='タスクを編集' onClose={closeEditModal}>
          <form onSubmit={handleEditSubmit}>
            <Input
              type='text'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              data-testid="edit-card-title-input"
            />
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder='カードの内容を入力...'
              data-testid="edit-card-content-input"
            />
            <ModalActions>
              <Button
                className='secondary'
                type='button'
                onClick={closeEditModal}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                className='primary'
                type='submit'
                disabled={isSaving}
                data-testid="submit-edit-card-button"
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
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button
              className='primary'
              onClick={handleDeleteConfirm}
              disabled={isSaving}
              data-testid="confirm-delete-card-button"
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
