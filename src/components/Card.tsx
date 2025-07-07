'use client';

import styled from 'styled-components';
import { Task as TaskType } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoard } from '@/context/BoardContext';

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
}

const Card = ({ task }: CardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const { editTask, deleteTask, board } = useBoard();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag-and-drop from interfering
    if (!board) {
      return;
    }
    const list = board.lists.find(l => l.tasks.some(t => t.id === task.id));
    if (!list) {
      return;
    }

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle !== null) {
      editTask(list.id, task.id, newTitle, task.content);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag-and-drop from interfering
    if (!board) {
      return;
    }
    const list = board.lists.find(l => l.tasks.some(t => t.id === task.id));
    if (!list) {
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(list.id, task.id);
    }
  };

  return (
    <CardContainer ref={setNodeRef} style={style} {...attributes}>
      <CardContent>
        <DragHandle {...listeners}>⠿</DragHandle>
        <CardTitle>{task.title}</CardTitle>
      </CardContent>
      <CardActions>
        <ActionButton onClick={handleEdit}>✏️</ActionButton>
        <ActionButton onClick={handleDelete}>🗑️</ActionButton>
      </CardActions>
    </CardContainer>
  );
};

export default Card;
