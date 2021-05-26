import { renderHook, act } from '@testing-library/react-hooks';

import useTreeState from './index';
import {
  testData,
  initializedTestData,
} from './testData';

import * as utils from './utils';

const {
  deepClone,
  initStateWithUniqIds,
  checkNode,
  setAllCheckedStatus,
  isValidCheckedStatus,
  getNewCheckStatus,
  toggleOpen,
  setAllOpenStatus,
  isValidOpenStatus,
  renameNode,
  deleteNode,
  findMaxId,
  addNode,
} = utils;

// const initStateWithUniqIdSpy = jest.spyOn(utils, 'initStateWithUniqIds');
// const checkNodeSpy = jest.spyOn(utils, 'checkNode');

test('initializa tree state', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const [treeState] = result.current;

  // expect(initStateWithUniqIdSpy).toHaveBeenCalledWith(testData);
  expect(treeState).toEqual(initializedTestData);
});

test('check node', () => {
  const { result } = renderHook(() => useTreeState({ data: testData }));
  const [treeState, reducers] = result.current;
  const { checkNode: handleCheckNode } = reducers;

  act(() => {
    handleCheckNode([], 1);
  });

  expect(treeState).toEqual(checkNode(deepClone(treeState), [], 1));

  act(() => {
    handleCheckNode([1], 0);
  });

  expect(treeState).toEqual(checkNode(deepClone(treeState), [1], 0));
});
