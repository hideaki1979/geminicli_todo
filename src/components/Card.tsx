'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Task as TaskType } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoard } from '@/context/BoardContext';
import Modal from './Modal';

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

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;

  &.primary {
    background-color: #0079bf;
    color: white;
    &:hover {
      background-color: #026aa7;
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

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 2px solid #dfe1e6;
  border-radius: 3px;
  box-sizing: border-box;
  &:focus {
    border-color: #4c9aff;
    outline: none;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      editTask(listId, task.id, newTitle, task.content);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    deleteTask(listId, task.id);
    setIsDeleteModalOpen(false);
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
              setIsEditModalOpen(true);
            }}
            aria-label='タスクを編集'
          >
            ✏️
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            aria-label='タスクを削除'
          >
            🗑️
          </ActionButton>
        </CardActions>
      </CardContainer>

      {isEditModalOpen && (
        <Modal title='タスクを編集' onClose={() => setIsEditModalOpen(false)}>
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
                onClick={() => setIsEditModalOpen(false)}
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
        <Modal title='タスクを削除' onClose={() => setIsDeleteModalOpen(false)}>
          <p>本当にこのタスクを削除しますか？</p>
          <p>
            <strong>{task.title}</strong>
          </p>
          <ModalActions>
            <Button
              className='secondary'
              onClick={() => setIsDeleteModalOpen(false)}
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
