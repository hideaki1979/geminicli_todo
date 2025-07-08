'use client';

import { DndContext, closestCorners } from '@dnd-kit/core';
import DndBoardContent from './DndBoardContent';

const Board = () => {
  return (
    <DndContext collisionDetection={closestCorners}>
      <DndBoardContent />
    </DndContext>
  );
};

export default Board;