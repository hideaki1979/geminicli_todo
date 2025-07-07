'use client';

import styled from 'styled-components';
import { type List as ListType, type Task as TaskType } from '@/types';
import Card from './Card';
import { useBoard } from '@/context/BoardContext';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

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
  const { addTask, editList, deleteList } = useBoard();
  const { setNodeRef } = useDroppable({ id: list.id });

  const handleAddTask = () => {
    const taskTitle = prompt('Enter a title for this card:');
    if (taskTitle) {
      addTask(list.id, taskTitle);
    }
  };

  const handleEditList = () => {
    const newTitle = prompt('Edit list title:', list.title);
    if (newTitle !== null) {
      editList(list.id, newTitle);
    }
  };

  const handleDeleteList = () => {
    if (confirm('Are you sure you want to delete this list and all its tasks?')) {
      deleteList(list.id);
    }
  };

  return (
    <ListContainer ref={setNodeRef}>
      <TitleContainer>
        <Title onClick={handleEditList}>{list.title}</Title>
        <ListActions>
          <ActionButton onClick={handleDeleteList}>🗑️</ActionButton>
        </ListActions>
      </TitleContainer>
      <SortableContext items={list.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <TaskList>
          {list.tasks.map((task: TaskType) => (
            <Card key={task.id} task={task} />
          ))}
        </TaskList>
      </SortableContext>
      <AddCardButton onClick={handleAddTask}>+ Add a card</AddCardButton>
    </ListContainer>
  );
};

export default List;
