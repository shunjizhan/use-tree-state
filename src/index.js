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

const EMPTY = {};
const useTreeState = ({
  data, onChange, options = EMPTY, customReducers = EMPTY,
}) => {
  const [treeState, setTreeState] = useState(null);
  const [event, setEvent] = useState({
    type: 'initialization',
    path: null,
    params: [],
  });
  const [reducers, setReducers] = useState({});

  useEffect(() => {
    const {
      initCheckedStatus = 'checked',
      initOpenStatus = 'open',
    } = options;
    const initState = initializeTreeState(data, initCheckedStatus, initOpenStatus);
    setTreeState(initState);
    updateReducers(customReducers);
  }, []);

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

  const updateReducers = _customReducers => {
    // built in reducers by path
    const newReducers = {
      setTreeState: _setTreeState,
      checkNode: getExternalReducer(checkNode, 'checkNode'),
      renameNode: getExternalReducer(renameNode, 'renameNode'),
      deleteNode: getExternalReducer(deleteNode, 'deleteNode'),
      addNode: getExternalReducer(addNode, 'addNode'),
      toggleOpen: getExternalReducer(toggleOpen, 'toggleOpen'),
    };

    // built in reducers by prop
    newReducers.checkNodeByProp = getReducerByProp(newReducers.checkNode);
    newReducers.renameNodeByProp = getReducerByProp(newReducers.renameNode);
    newReducers.deleteNodeByProp = getReducerByProp(newReducers.deleteNode);
    newReducers.addNodeByProp = getReducerByProp(newReducers.addNode);
    newReducers.toggleOpenByProp = getReducerByProp(newReducers.toggleOpen);

    // custom reducers
    Object.entries(_customReducers).forEach(([name, f]) => {
      newReducers[name] = getExternalReducer(f, name);
    });

    setReducers(newReducers.checkNode);
  };

  console.log(reducers);
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
