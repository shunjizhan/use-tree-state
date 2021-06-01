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

const useTreeState = ({ data, onChange, options = {}, customReducers = {} }) => {
  const [treeState, setTreeState] = useState(null);
  const [event, setEvent] = useState(null);

  const {
    initCheckedStatus,
    initOpenStatus,
  } = options;
  useEffect(() => {
    const initState = initializeTreeState(data, initCheckedStatus, initOpenStatus);
    setTreeState(initState);
  }, [data, initCheckedStatus, initOpenStatus]);

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

  const getExternalReducer = (reducer, name) => (path, ...params) => {
    const e = getEvent(name, path, ...params);
    const newState = reducer(treeState, path, ...params);

    setEvent(e);
    setTreeState(newState);
  };

  const _customReducers = Object.fromEntries(
    Object.entries(customReducers).map(
      ([name, f]) => ([name, getExternalReducer(f, name)])
    )
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

  return {
    treeState,
    reducers,
  };
};

export default useTreeState;
export {
  findTargetNode,
  findAllTargetPathByProp,
  findTargetPathByProp,
};
