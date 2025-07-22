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
                { id: 'task-2', title: 'Task 2', content: '' },
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

        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            // task-1 を task-2 の位置に移動するが、arrayMoveの実装上インデックスが変わらない
            await result.current.moveTask('task-1', 'task-1', 'list-1');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

describe('BoardContext - addTask', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('指定したリストに新しいタスクを追加できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const listId = 'list-1';
        const initialTaskCount = result.current.board?.lists.find(l => l.id === listId)?.tasks.length || 0;

        await act(async () => {
            await result.current.addTask(listId, 'New Task');
        });

        const updatedList = result.current.board?.lists.find(l => l.id === listId);
        expect(updatedList?.tasks.length).toBe(initialTaskCount + 1);
        expect(updatedList?.tasks[updatedList.tasks.length - 1].title).toBe('New Task');
    });

    it('存在しないリストIDにタスクを追加しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.addTask('non-existent-list', 'New Task');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

describe('BoardContext - editTask', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('指定したタスクのタイトルとコンテンツを編集できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const listId = 'list-1';
        const taskId = 'task-1';
        const newTitle = 'Updated Task 1';
        const newContent = 'Updated Content for Task 1';

        await act(async () => {
            await result.current.editTask(listId, taskId, newTitle, newContent);
        });

        const updatedTask = result.current.board?.lists.find(l => l.id === listId)?.tasks.find(t => t.id === taskId);
        expect(updatedTask?.title).toBe(newTitle);
        expect(updatedTask?.content).toBe(newContent);
    });

    it('存在しないタスクIDを編集しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.editTask('list-1', 'non-existent-task', 'New Title', 'New Content');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });

    it('存在しないリストIDのタスクを編集しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.editTask('non-existent-list', 'task-1', 'New Title', 'New Content');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

describe('BoardContext - deleteTask', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('指定したタスクを削除できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const listId = 'list-1';
        const taskId = 'task-1';
        const initialTaskCount = result.current.board?.lists.find(l => l.id === listId)?.tasks.length || 0;

        await act(async () => {
            await result.current.deleteTask(listId, taskId);
        });

        const updatedList = result.current.board?.lists.find(l => l.id === listId);
        expect(updatedList?.tasks.length).toBe(initialTaskCount - 1);
        expect(updatedList?.tasks.find(t => t.id === taskId)).toBeUndefined();
    });

    it('存在しないタスクIDを削除しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.deleteTask('list-1', 'non-existent-task');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });

    it('存在しないリストIDのタスクを削除しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.deleteTask('non-existent-list', 'task-1');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

describe('BoardContext - addList', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('新しいリストを追加できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const initialListCount = result.current.board?.lists.length || 0;

        await act(async () => {
            await result.current.addList('New List');
        });

        expect(result.current.board?.lists.length).toBe(initialListCount + 1);
        expect(result.current.board?.lists[result.current.board.lists.length - 1].title).toBe('New List');
    });
});

describe('BoardContext - editList', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('指定したリストのタイトルを編集できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const listId = 'list-1';
        const newTitle = 'Updated List 1';

        await act(async () => {
            await result.current.editList(listId, newTitle);
        });

        const updatedList = result.current.board?.lists.find(l => l.id === listId);
        expect(updatedList?.title).toBe(newTitle);
    });

    it('存在しないリストIDを編集しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.editList('non-existent-list', 'New Title');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

describe('BoardContext - deleteList', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response)
        );
    });

    it('指定したリストを削除できること', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const listId = 'list-1';
        const initialListCount = result.current.board?.lists.length || 0;

        await act(async () => {
            await result.current.deleteList(listId);
        });

        expect(result.current.board?.lists.length).toBe(initialListCount - 1);
        expect(result.current.board?.lists.find(l => l.id === listId)).toBeUndefined();
    });

    it('存在しないリストIDを削除しようとした場合、ボードの状態が変化しないこと', async () => {
        const { result } = renderHook(() => useBoard(), { wrapper });
        const originalBoardState = JSON.stringify(result.current.board);

        await act(async () => {
            await result.current.deleteList('non-existent-list');
        });

        expect(JSON.stringify(result.current.board)).toEqual(originalBoardState);
    });
});

