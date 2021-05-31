import { renderHook, act } from '@testing-library/react-hooks';

import useTreeState, { getEvent } from '../index';
import {
  testData,
  initializedTestData,
} from './testData';

import {
  findTargetNode,
  deepClone,
  checkNode,
  setAllCheckedStatus,
  toggleOpen,
  setAllOpenStatus,
  renameNode,
  deleteNode,
  addNode,
} from '../utils';

describe('initialize tree state', () => {
  test('default options', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    expect(result.current.treeState).toEqual(initializedTestData);
  });

  test('custom initCheckedStatus = checked', () => {
    const expected = setAllCheckedStatus(deepClone(initializedTestData), 1);
    const options = {
      initCheckedStatus: 'checked',
    };
    const { result } = renderHook(() => useTreeState({ data: testData, options }));
    expect(result.current.treeState).toEqual(expected);
  });

  test('custom initCheckedStatus = unchecked', () => {
    const expected = setAllCheckedStatus(deepClone(initializedTestData), 0);
    const options = {
      initCheckedStatus: 'unchecked',
    };
    const { result } = renderHook(() => useTreeState({ data: testData, options }));
    expect(result.current.treeState).toEqual(expected);
  });

  test('custom initOpenStatus = open', () => {
    const expected = setAllOpenStatus(deepClone(initializedTestData), true);
    const options = {
      initOpenStatus: 'open',
    };
    const { result } = renderHook(() => useTreeState({ data: testData, options }));
    expect(result.current.treeState).toEqual(expected);
  });

  test('custom initOpenStatus = closed', () => {
    const expected = setAllOpenStatus(deepClone(initializedTestData), false);
    const options = {
      initOpenStatus: 'closed',
    };
    const { result } = renderHook(() => useTreeState({ data: testData, options }));
    expect(result.current.treeState).toEqual(expected);
  });
});

test('check node', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { treeState, reducers } = result.current;
  const { checkNode: check } = reducers;
  let expected;

  expected = checkNode(deepClone(treeState), [], 1);
  act(() => {
    check([], 1);
  });
  expect(result.current.treeState).toEqual(expected);

  expected = checkNode(deepClone(treeState), [1], 0);
  act(() => {
    check([1], 0);
  });
  expect(result.current.treeState).toEqual(expected);

  expected = checkNode(deepClone(treeState), [3, 1], 0);
  act(() => {
    check([3, 1], 0);
  });
  expect(result.current.treeState).toEqual(expected);
});

test('toggle open', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { treeState, reducers } = result.current;
  const { toggleOpen: toggle } = reducers;
  let expected;

  expected = toggleOpen(deepClone(treeState), [], 1);
  act(() => {
    toggle([], 1);
  });
  expect(result.current.treeState).toEqual(expected);

  expected = toggleOpen(deepClone(treeState), [3], 0);
  act(() => {
    toggle([3], 0);
  });
  expect(result.current.treeState).toEqual(expected);

  try {
    toggleOpen(deepClone(treeState), [3, 1], 0);
  } catch (e) {
    expect(e.message).toEqual('only parent node (folder) can be opened!!');
  }
});

test('rename node', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { treeState, reducers } = result.current;
  const { renameNode: rename } = reducers;
  let expected;

  expected = renameNode(deepClone(treeState), [], 'Bitcoin');
  act(() => {
    rename([], 'Bitcoin');
  });
  expect(result.current.treeState).toEqual(expected);

  expected = renameNode(deepClone(treeState), [1], 'Polkadot');
  act(() => {
    rename([1], 'Polkadot');
  });
  expect(result.current.treeState).toEqual(expected);

  expected = renameNode(deepClone(treeState), [3, 1], 'Kusama');
  act(() => {
    rename([3, 1], 'Kusama');
  });
  expect(result.current.treeState).toEqual(expected);
});

test('add node', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { treeState, reducers } = result.current;
  const { addNode: add } = reducers;
  let expected;

  expected = addNode(deepClone(treeState), [], 'file');
  act(() => {
    add([], 'file');
  });
  expect(result.current.treeState).toEqual(expected);

  expected = addNode(deepClone(treeState), [4], 'folder');
  act(() => {
    add([4], 'folder');
  });
  expect(result.current.treeState).toEqual(expected);

  try {
    expected = addNode(deepClone(treeState), [1], 'folder');
  } catch (e) {
    expect(e.message).toEqual('can\'t add node to a file!!');
  }
});

test('delete node', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { treeState, reducers } = result.current;
  const { deleteNode: del } = reducers;

  let expected = deleteNode(deepClone(treeState), [3, 1]);
  act(() => {
    del([3, 1]);
  });
  expect(result.current.treeState).toEqual(expected);

  expected = deleteNode(deepClone(treeState), [2]);
  act(() => {
    del([2]);
  });
  expect(result.current.treeState).toEqual(expected);

  expected = deleteNode(deepClone(treeState), []);
  act(() => {
    del([]);
  });
  expect(result.current.treeState).toEqual(expected);
});

test('set tree state directly', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const { reducers } = result.current;
  const { setTreeState } = reducers;

  const newState = {
    name: 'pikachu',
  };

  act(() => {
    setTreeState(newState);
  });
  expect(result.current.treeState).toEqual(newState);
});

test('custom reducer', () => {
  const renameToPikachuNTimes = (root, path, n) => {
    const targetNode = findTargetNode(root, path);
    targetNode.name = 'pikachu'.repeat(n);

    return { ...root };
  };

  const customReducers = {
    renameToPikachuNTimes,
  };

  const { result } = renderHook(() => useTreeState({
    data: testData,
    customReducers,
  }));
  const { treeState, reducers } = result.current;

  act(() => {
    reducers.renameToPikachuNTimes([], 2);
  });
  expect(treeState.name).toEqual('pikachupikachu');

  act(() => {
    reducers.renameToPikachuNTimes([3, 1], 3);
  });
  expect(treeState.children[3].children[1].name).toEqual('pikachupikachupikachu');
});

describe('getEvent', () => {
  const eventName = 'Goku';
  const path = [1];
  test('when there is no extra params', () => {
    expect(getEvent(eventName, path)).toEqual({
      type: eventName,
      path,
      params: [],
    });

    expect(getEvent(eventName, null)).toEqual({
      type: eventName,
      path: null,
      params: [],
    });
  });

  test('when there are extra params', () => {
    const extra = 'Cosmos';
    const state = {};

    expect(getEvent(eventName, path, state, extra)).toEqual({
      type: eventName,
      path,
      params: [state, extra],
    });

    expect(getEvent(eventName, null, state, extra)).toEqual({
      type: eventName,
      path: null,
      params: [state, extra],
    });
  });
});

test('onChange', () => {
  let expectedState;
  const onChange = jest.fn();

  const renameToPikachuNTimes = (root, path, n) => {
    const targetNode = findTargetNode(root, path);
    targetNode.name = 'pikachu' * n;

    return { ...root };
  };

  const customReducers = {
    renameToPikachuNTimes,
  };

  const { result } = renderHook(() => useTreeState({
    data: testData,
    onChange,
    customReducers,
  }));
  const { reducers } = result.current;

  const newState = {
    name: 'pikachu',
  };
  const path = [];
  const newName = 'Republic of Gamers';

  expectedState = checkNode(deepClone(result.current.treeState), path, 1);
  act(() => { reducers.checkNode(path, 1); });
  expect(onChange.mock.calls[0]).toEqual([
    expectedState,
    {
      type: 'checkNode',
      path,
      params: [1],
    },
  ]);

  expectedState = renameNode(deepClone(result.current.treeState), path, newName);
  act(() => { reducers.renameNode(path, newName); });
  expect(onChange.mock.calls[1]).toEqual([
    expectedState,
    {
      type: 'renameNode',
      path,
      params: [newName],
    },
  ]);

  expectedState = deleteNode(deepClone(result.current.treeState), path);
  act(() => { reducers.deleteNode(path); });
  expect(onChange.mock.calls[2]).toEqual([
    expectedState,
    {
      type: 'deleteNode',
      path,
      params: [],
    },
  ]);

  expectedState = addNode(deepClone(result.current.treeState), path, 'file');
  act(() => { reducers.addNode(path, 'file'); });
  expect(onChange.mock.calls[3]).toEqual([
    expectedState,
    {
      type: 'addNode',
      path,
      params: ['file'],
    },
  ]);

  expectedState = addNode(deepClone(result.current.treeState), path, 'folder');
  act(() => { reducers.addNode(path, 'folder'); });
  expect(onChange.mock.calls[4]).toEqual([
    expectedState,
    {
      type: 'addNode',
      path,
      params: ['folder'],
    },
  ]);

  expectedState = renameToPikachuNTimes(deepClone(result.current.treeState), path, 5);
  act(() => { reducers.renameToPikachuNTimes(path, 5); });
  expect(onChange.mock.calls[5]).toEqual([
    renameToPikachuNTimes(deepClone(result.current.treeState), path, 5),
    {
      type: 'renameToPikachuNTimes',
      path,
      params: [5],
    },
  ]);

  expectedState = newState;
  act(() => { reducers.setTreeState(newState); });
  expect(onChange.mock.calls[6]).toEqual([
    expectedState,
    {
      type: 'setTreeState',
      path: null,
      params: [newState],
    },
  ]);
});
