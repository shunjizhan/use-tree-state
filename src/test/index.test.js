import { renderHook, act } from '@testing-library/react-hooks';

import useTreeState, { findTargetPathByProp } from '../index';
import {
  testData,
  initializedTestData,
} from './testData';

import {
  deepClone,
  findTargetNode,
  setAllCheckedStatus,
  setAllOpenStatus,

  checkNode,
  toggleOpen,
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

describe('check node', () => {
  test('by path', () => {
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

  test('by prop', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { checkNodeByProp: checkByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      checkByProp('name', 'not exist', 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      checkByProp('not exist', 123, 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = checkNode(deepClone(treeState), [], 1);
    act(() => {
      checkByProp('name', 'All Cryptos', 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = checkNode(deepClone(treeState), [4, 1], 0);
    act(() => {
      checkByProp('_id', 10, 0);
    });
    expect(result.current.treeState).toEqual(expected);
  });
});

describe('toggle open', () => {
  test('by path', () => {
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
      toggle([3, 1], 0);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }
  });

  test('by prop', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { toggleOpenByProp: toggleByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      toggleByProp('name', 'not exist', 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      toggleByProp('not exist', 123, 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = toggleOpen(deepClone(treeState), [], 1);
    act(() => {
      toggleByProp('name', 'All Cryptos', 1);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = toggleOpen(deepClone(treeState), [4, 3], 0);
    act(() => {
      toggleByProp('_id', 15, 0);
    });
    expect(result.current.treeState).toEqual(expected);

    try {
      toggleByProp('name', 'Chainlink', 0);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }
  });
});

describe('rename node', () => {
  test('by path', () => {
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

  test('by prop', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { renameNodeByProp: renameByProp } = reducers;
    let expected;
    const newName = 'Kusama';

    expected = deepClone(treeState);
    act(() => {
      renameByProp('name', 'not exist', newName);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      renameByProp('not exist', 123, newName);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = renameNode(deepClone(treeState), [], newName);
    act(() => {
      renameByProp('name', 'All Cryptos', newName);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = renameNode(deepClone(treeState), [3, 0], newName);
    act(() => {
      renameByProp('_id', 5, newName);
    });
    expect(result.current.treeState).toEqual(expected);
  });
});

describe('add node', () => {
  test('by path', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { addNode: add } = reducers;
    let expected;

    expected = addNode(deepClone(treeState), [], false);
    act(() => {
      add([], false);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = addNode(deepClone(treeState), [4], true);
    act(() => {
      add([4], true);
    });
    expect(result.current.treeState).toEqual(expected);

    try {
      expected = add([1], true);
    } catch (e) {
      expect(e.message).toEqual('can\'t add node to a file!!');
    }
  });

  test('by prop', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { addNodeByProp: addByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      addByProp('name', 'not exist', true);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      addByProp('not exist', 123, false);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = addNode(deepClone(treeState), [], true);
    act(() => {
      addByProp('name', 'All Cryptos', true);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = addNode(deepClone(treeState), [5], false);
    act(() => {
      addByProp('name', 'new folder', false);
    });
    expect(result.current.treeState).toEqual(expected);

    try {
      addByProp('name', 'Ripple', false);
    } catch (e) {
      expect(e.message).toEqual('can\'t add node to a file!!');
    }
  });
});

describe('delete node', () => {
  test('by path', () => {
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

  test('by prop', () => {
    const { result } = renderHook(() => useTreeState({ data: testData }));
    const { treeState, reducers } = result.current;
    const { deleteNodeByProp: deleteByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      deleteByProp('name', 'not exist');
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      deleteByProp('not exist', 123);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deleteNode(deepClone(treeState), [3, 0]);
    act(() => {
      deleteByProp('_id', 5);
    });
    expect(result.current.treeState).toEqual(expected);

    expected = deleteNode(deepClone(treeState), []);
    act(() => {
      deleteByProp('name', 'All Cryptos');
    });
    expect(result.current.treeState).toEqual(expected);
  });
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

  const renameToGokuByName = (root, _, targetName) => {
    const path = findTargetPathByProp(root, 'name', targetName);
    const targetNode = findTargetNode(root, path);
    targetNode.name = 'Goku';

    return { ...root };
  };

  const customReducers = {
    renameToPikachuNTimes,
    renameToGokuByName,
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

  act(() => {
    reducers.renameToGokuByName(null, 'pikachupikachupikachu');
  });
  expect(treeState.children[3].children[1].name).toEqual('Goku');
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

  expectedState = initializedTestData;
  expect(onChange.mock.calls[0]).toEqual([
    expectedState,
    {
      type: 'initialization',
      path: null,
      params: [],
    },
  ]);

  expectedState = checkNode(deepClone(result.current.treeState), path, 1);
  act(() => { reducers.checkNode(path, 1); });
  expect(onChange.mock.calls[1]).toEqual([
    expectedState,
    {
      type: 'checkNode',
      path,
      params: [1],
    },
  ]);

  expectedState = renameNode(deepClone(result.current.treeState), path, newName);
  act(() => { reducers.renameNode(path, newName); });
  expect(onChange.mock.calls[2]).toEqual([
    expectedState,
    {
      type: 'renameNode',
      path,
      params: [newName],
    },
  ]);

  expectedState = deleteNode(deepClone(result.current.treeState), path);
  act(() => { reducers.deleteNode(path); });
  expect(onChange.mock.calls[3]).toEqual([
    expectedState,
    {
      type: 'deleteNode',
      path,
      params: [],
    },
  ]);

  expectedState = addNode(deepClone(result.current.treeState), path, false);
  act(() => { reducers.addNode(path, false); });
  expect(onChange.mock.calls[4]).toEqual([
    expectedState,
    {
      type: 'addNode',
      path,
      params: [false],
    },
  ]);

  expectedState = addNode(deepClone(result.current.treeState), path, true);
  act(() => { reducers.addNode(path, true); });
  expect(onChange.mock.calls[5]).toEqual([
    expectedState,
    {
      type: 'addNode',
      path,
      params: [true],
    },
  ]);

  expectedState = renameToPikachuNTimes(deepClone(result.current.treeState), path, 5);
  act(() => { reducers.renameToPikachuNTimes(path, 5); });
  expect(onChange.mock.calls[6]).toEqual([
    renameToPikachuNTimes(deepClone(result.current.treeState), path, 5),
    {
      type: 'renameToPikachuNTimes',
      path,
      params: [5],
    },
  ]);

  expectedState = newState;
  act(() => { reducers.setTreeState(newState); });
  expect(onChange.mock.calls[7]).toEqual([
    expectedState,
    {
      type: 'setTreeState',
      path: null,
      params: [newState],
    },
  ]);
});
