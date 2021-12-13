import React, {
  useEffect,
  useState,
} from 'react';

import {
  checkNode,
  renameNode,
  deleteNode,
  addNode,
  toggleOpen,
  getEvent,
  initializeTreeState,
  findTargetNode,
  findAllTargetPathByProp,
  findTargetPathByProp,
} from './utils';

import { testData } from './test/testData';

const useTreeState = ({
  data, onChange, options = {}, customReducers = {},
}) => {
  const [initialized, setInitialized] = useState(false);
  const [treeState, setTreeState] = useState(null);
  const [event, setEvent] = useState({
    type: 'initialization',
    path: null,
    params: [],
  });

  const {
    initCheckedStatus,
    initOpenStatus,
  } = options;

  useEffect(() => {
    if (!initialized) {
      const initState = initializeTreeState(data, initCheckedStatus, initOpenStatus);
      setTreeState(initState);
      setInitialized(true);
    } else {
      setTreeState(data);
    }
  }, [data]);

  useEffect(() => {
    if (typeof onChange === 'function' && treeState && event) {
      onChange(treeState, event);
    }
  }, [treeState, event]);

  const _setTreeState = state => {
    const e = getEvent('setTreeState', null, state);

    setEvent(e);
    setTreeState(state);
  };

  const getExternalReducer = (reducer, name) => (path, ...args) => {
    const _path = path ? [...path] : null;
    const e = getEvent(name, _path, ...args);
    const newState = reducer(treeState, _path, ...args);

    setEvent(e);
    setTreeState(newState);
  };

  const getReducerByProp = reducer => (propName, targetValue, ...args) => {
    const path = findTargetPathByProp(treeState, propName, targetValue);
    return path ? reducer(path, ...args) : null;
  };

  const _customReducers = Object.fromEntries(
    Object.entries(customReducers).map(
      ([name, f]) => ([name, getExternalReducer(f, name)]),
    ),
  );

  const reducers = {
    setTreeState: _setTreeState,
    checkNode: getExternalReducer(checkNode, 'checkNode'),
    renameNode: getExternalReducer(renameNode, 'renameNode'),
    deleteNode: getExternalReducer(deleteNode, 'deleteNode'),
    addNode: getExternalReducer(addNode, 'addNode'),
    toggleOpen: getExternalReducer(toggleOpen, 'toggleOpen'),
    ..._customReducers,
  };

  reducers.checkNodeByProp =  getReducerByProp(reducers.checkNode);
  reducers.renameNodeByProp =  getReducerByProp(reducers.renameNode);
  reducers.deleteNodeByProp =  getReducerByProp(reducers.deleteNode);
  reducers.addNodeByProp =  getReducerByProp(reducers.addNode);
  reducers.toggleOpenByProp =  getReducerByProp(reducers.toggleOpen);

  return {
    treeState,
    reducers,
  };
};

export default useTreeState;
export {
  testData,
  findTargetNode,
  findAllTargetPathByProp,
  findTargetPathByProp,
};
