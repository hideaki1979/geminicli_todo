'use client';

import styled from 'styled-components';
import { type List as ListType, type Task as TaskType } from '@/types';
import Card from './Card';
import { useBoard } from '@/context/BoardContext';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Modal from './Modal';
import { useState } from 'react';

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

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 5px;
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

  &.danger {
    background-color: #eb5a46;
    color: white;
    &:hover {
      background-color: #c44738;
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

interface ListProps {
  list: ListType;
}

const List = ({ list }: ListProps) => {
  const { addTask, editList, deleteList } = useBoard();
  const { setNodeRef } = useDroppable({ id: list.id });
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState(list.title);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(list.id, newTaskTitle);
      setNewTaskTitle('')
      setIsAddTaskModalOpen(false)
    }
  }

  const handleEditListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      editList(list.id, newListTitle);
      setIsEditListModalOpen(false)
    }
  }

  const handleDeleteListConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    deleteList(list.id);
    setIsDeleteListModalOpen(false)
  }

  return (
    <>
      <ListContainer ref={setNodeRef}>
        <TitleContainer>
          <Title
            role='button'
            tabIndex={0}
            onClick={() => setIsEditListModalOpen(true)}
            aria-label='リストを編集'
          >
            {list.title}
          </Title>
          <ListActions>
            <ActionButton
              onClick={() => setIsDeleteListModalOpen(true)}
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
        <AddCardButton onClick={() => setIsAddTaskModalOpen(true)}>
          カートを追加
        </AddCardButton>
      </ListContainer>

      {isAddTaskModalOpen && (
        <Modal title='新しいカードを追加' onClose={() => setIsAddTaskModalOpen(false)}>
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
                onClick={() => setIsAddTaskModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button className='primary' type='submit'>
                追加
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {isEditListModalOpen && (
        <Modal title='リストのタイトルを編集' onClose={() => setIsEditListModalOpen(false)}>
          <form onSubmit={handleEditListSubmit}>
            <Input
              type='text'
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
            />
            <ModalActions>
              <Button
                className='secondary'
                type='button'
                onClick={() => setIsEditListModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button className='primary' type='submit'>
                保存
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {isDeleteListModalOpen && (
        <Modal title='リストを削除' onClose={() => setIsDeleteListModalOpen(false)}>
          <p>このリストとリストにある全てのカードを削除しますか？</p>
          <p>
            <strong>{list.title}</strong>
          </p>
          <ModalActions>
            <Button className='secondary' onClick={() => setIsDeleteListModalOpen(false)}>
              キャンセル
            </Button>
            <Button className='danger' onClick={handleDeleteListConfirm}>
              削除
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  );
};

export default List;
