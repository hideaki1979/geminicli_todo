'use client';

import styled from 'styled-components';
import { type List as ListType, type Task as TaskType } from '@/types';
import Card from './Card';
import { useBoard } from '@/context/BoardContext';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Modal from './Modal';
import { useState } from 'react';
import useModal from '@/hooks/useModal';
import { ModalActions, Button, Input } from '@/components/common/ModalElements';

const ListContainer = styled.div`
  background-color: #ebecf0;
  border-radius: 3px;
  width: 272px;
  padding: 8px;
  margin-right: 8px;
  flex-shrink: 0;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const ListActions = styled.div`
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

const TaskList = styled.div`
  padding: 8px;
  min-height: 20px;
`;

const AddCardButton = styled.button`
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 8px 12px;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background-color: #026aa7;
  }
`;

interface ListProps {
  list: ListType;
}

const List = ({ list }: ListProps) => {
  const { addTask, editList, deleteList, loading } = useBoard();
  const { setNodeRef } = useDroppable({ id: list.id });
  const { isOpen: isAddTaskModalOpen, openModal: openAddTaskModal, closeModal: closeAddTaskModal } = useModal();
  const { isOpen: isEditListModalOpen, openModal: openEditListModal, closeModal: closeEditListModal } = useModal();
  const { isOpen: isDeleteListModalOpen, openModal: openDeleteListModal, closeModal: closeDeleteListModal } = useModal();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState(list.title);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(list.id, newTaskTitle);
      setNewTaskTitle('')
      closeAddTaskModal()
    }
  }

  const handleEditListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      editList(list.id, newListTitle);
      closeEditListModal()
    }
  }

  const handleDeleteListConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    deleteList(list.id);
    closeDeleteListModal()
  }

  return (
    <>
      <ListContainer ref={setNodeRef}>
        <TitleContainer>
          <Title
            role='button'
            tabIndex={0}
            onClick={openEditListModal}
            aria-label='リストを編集'
          >
            {list.title}
          </Title>
          <ListActions>
            <ActionButton
              onClick={openDeleteListModal}
              aria-label='リストを削除'>
              🗑️
            </ActionButton>
          </ListActions>
        </TitleContainer>
        <SortableContext items={list.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <TaskList>
            {list.tasks.map((task: TaskType) => (
              <Card key={task.id} task={task} listId={list.id} />
            ))}
          </TaskList>
        </SortableContext>
        <AddCardButton onClick={openAddTaskModal}>
          カードを追加
        </AddCardButton>
      </ListContainer>

      {isAddTaskModalOpen && (
        <Modal title='新しいカードを追加' onClose={closeAddTaskModal}>
          <form onSubmit={handleAddTaskSubmit}>
            <Input
              type='text'
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder='カードのタイトルを入力...'
              autoFocus
            />
            <ModalActions>
              <Button
                className='secondary'
                type='button'
                onClick={closeAddTaskModal}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button className='primary' type='submit' disabled={loading}>
                追加
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {isEditListModalOpen && (
        <Modal title='リストのタイトルを編集' onClose={closeEditListModal}>
          <form onSubmit={handleEditListSubmit}>
            <Input
              type='text'
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <ModalActions>
              <Button
                className='secondary'
                type='button'
                onClick={closeEditListModal}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button className='primary' type='submit' disabled={loading}>
                保存
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {isDeleteListModalOpen && (
        <Modal title='リストを削除' onClose={closeDeleteListModal}>
          <p>このリストとリストにある全てのカードを削除しますか？</p>
          <p>
            <strong>{list.title}</strong>
          </p>
          <ModalActions>
            <Button
              className='secondary'
              onClick={closeDeleteListModal}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              className='danger'
              onClick={handleDeleteListConfirm}
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

export default List;
