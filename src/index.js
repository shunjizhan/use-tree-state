import React, {
  useEffect,
  useState,
} from 'react';

import {
  initStateWithUniqIds,
  setAllCheckedStatus,
  setAllOpenStatus,
  isValidCheckedStatus,
  isValidOpenStatus,
  checkNode,
  renameNode,
  deleteNode,
  addNode,
  toggleOpen,
} from './utils';

export const getEvent = (eventName, path, ...params) => ({
  type: eventName,
  path,
  params,
});

const useTreeState = ({ data, onChange, options = {}, customReducers = {} }) => {
  const {
    initCheckedStatus = 'unchecked',
    initOpenStatus = 'open',
  } = options;

  const [treeState, setTreeState] = useState(null);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (typeof onChange === 'function' && treeState && event) {
      onChange(treeState, event);
    }
  }, [treeState, event]);

  const initTreeState = (_data, _initCheckedStatus, _initOpenStatus) => {
    let initState = initStateWithUniqIds(_data);

    switch (_initCheckedStatus) {
      case 'unchecked':
        initState = setAllCheckedStatus(initState, 0);
        break;

      case 'checked':
        initState = setAllCheckedStatus(initState, 1);
        break;

      default:
        if (!isValidCheckedStatus(initState)) {
          console.warn('checked status is not provided! Fell back to all unchecked.');
          initState = setAllCheckedStatus(initState, 0);
        }
    }

    switch (_initOpenStatus) {
      case 'open':
        initState = setAllOpenStatus(initState, true);
        break;

      case 'closed':
        initState = setAllOpenStatus(initState, false);
        break;

      default:
        if (!isValidOpenStatus(initState)) {
          console.warn('open status is not provided! Fell back to all opened.');
          initState = setAllOpenStatus(initState, true);
        }
    }

    return initState;
  };

  useEffect(() => {
    const initState = initTreeState(data, initCheckedStatus, initOpenStatus);
    setTreeState(initState);
  }, [data, initCheckedStatus, initOpenStatus]);

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
