import { Board as BoardType } from "@/types";
import { ReactNode } from "react";
import { BoardProvider, useBoard } from "./BoardContext";
import { renderHook, act } from "@testing-library/react";
import { randomUUID } from "crypto";


// crypto.randomUUID がテスト環境 (JSDOM) で未定義なため、モックします。
global.crypto = {
    ...global.crypto,
    randomUUID,
};

const initialBoard: BoardType = {
    id: 'board-1',
    title: 'Test Board',
    lists: [
        {
            id: 'list-1',
            title: 'To Do',
            tasks: [
                { id: 'task-1', title: 'Task 1', content: '' },
                { id: 'task-3', title: 'Task 2', content: '' },
            ]
        },
        {
            id: 'list-2',
            title: 'In Progress',
            tasks: [{ id: 'task-3', title: 'Task 3', content: '' }],
        },
        {
            id: 'list-3',
            title: 'Done',
            tasks: [], // 空のリスト
        },
    ],
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <BoardProvider initialBoard={initialBoard}>{children}</BoardProvider>
);

describe('BoardContext - moveTask', () => {
    // `fetch` をモックして、API呼び出しが成功したように見せかけます。
    beforeAll(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('異なるリスト間でタスクを移動できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });

        await act(async () => {
            await result.current.moveTask('task-1', 'list-2', 'list-1');
        });

        const list1 = result.current.board?.lists.find(l => l.id === 'list-1');
        const list2 = result.current.board?.lists.find(l => l.id === 'list-2');

        expect(list1?.tasks.find(t => t.id === 'task-1')).toBeUndefined();
        expect(list2?.tasks.find(t => t.id === 'task-1')).toBeDefined();
        expect(list2?.tasks[1].id).toBe('task-1');  // 配列の末尾に追加される
    });

    it('存在しないタスクIDを渡した場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.moveTask('non-existent-task', 'list-2', 'list-1')
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });

    it('存在しない移動元リストIDを渡した場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.moveTask('task-1', 'list-2', 'non-existent-list');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });

    it('存在しない移動先リストIDを渡した場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.moveTask('task-1', 'non-existent-list', 'list-1');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });

    it('空のリストにタスクを移動できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });

        await act(async () => {
            await result.current.moveTask('task-1', 'list-3', 'list-1');
        });

        const list1 = result.current.board?.lists.find(l => l.id === 'list-1');
        const list3 = result.current.board?.lists.find(l => l.id === 'list-3');

        expect(list1?.tasks.some(t => t.id === 'task-1')).toBe(false);
        expect(list3?.tasks.some(t => t.id === 'task-1')).toBe(true);
        expect(list3?.tasks.length).toBe(1);
    });

    it('同じ位置にタスクを移動させた場合、ボードの状態が変化しないこと（同一リスト内）', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });

        const originalList1Tasks = result.current.board?.lists.find(l => l.id === 'list-1')?.tasks;
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            // task-1 を task-2 の位置に移動するが、arrayMoveの実装上インデックスが変わらない
            await result.current.moveTask('task-1', 'tast-2', 'list-1');
        });

        // arrayMoveの挙動により順序は変わるため、状態の完全一致ではテストできない
        const list1 = result.current.board?.lists.find(l => l.id === 'list-1');
        expect(list1?.tasks.length).toBe(originalList1Tasks?.length);
        expect(list1?.tasks.map(t => t.id).sort()).toEqual(originalList1Tasks?.map(t => t.id).sort())
        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState)
    });
});