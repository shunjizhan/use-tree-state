export const deepClone = x => JSON.parse(JSON.stringify(x));

export const findTargetNode = (root, path) => {
  let curNode = root;
  for (const idx of path) {
    const { children } = curNode;
    if (idx >= children.length || idx < 0) {
      throw new Error('finding node failed: invalid path!!');
    }
    curNode = children[idx];
  }

  return curNode;
};

export const findMaxId = rootNode => {
  const { children } = rootNode;
  const curId = rootNode._id;

  return children
    ? Math.max(...[curId, ...children.map(findMaxId)])
    : curId;
};

// deepclone the initial data for internal use, and assign uniq ids to each node
// deepclone only happens once at initialization, other operations will be in-place
export const initStateWithUniqIds = rootNode => {
  let curId = 0;
  const _addId = node => {
    node._id = curId;  // eslint-disable-line
    curId += 1;

    const { children } = node;
    if (children) {
      for (const child of children) {
        _addId(child);
      }
    }

    return node;
  };

  return _addId(deepClone(rootNode));
};

// recursively set status for this node and all children, in place
const setStatusDown = (node, status) => {
  node.checked = status;  // eslint-disable-line
  const { children } = node;
  if (children) {
    for (const child of children) {
      setStatusDown(child, status);
    }
  }
  return { ...node };
};

// set checked status for all nodes
export const setAllCheckedStatus = setStatusDown;

// calculate the check status of a node based on the check status of it's children
export const getNewCheckStatus = node => {
  const { children } = node;
  if (!children?.length > 0) return node.checked;

  let sum = 0;
  for (const c of children) {
    sum += c.checked;
  }

  let newCheckStatus = 0.5;   // some checked
  if (sum === children.length) {
    newCheckStatus = 1;       // all checked
  } else if (sum === 0) {
    newCheckStatus = 0;       // all unchecked
  }

  return newCheckStatus;
};

// recursively update check status up
export const updateStatusUp = nodes => {
  if (nodes.length === 0) return;

  const curNode = nodes.pop();
  curNode.checked = getNewCheckStatus(curNode);

  updateStatusUp(nodes);
};

// handle state change when user (un)check a TreeNode
export const checkNode = (rootNode, path, status) => {
  let curNode = rootNode;
  const parentNodes = [curNode];        // parent nodes for getNewCheckStatus() upwards

  for (const idx of path) {
    curNode = curNode.children[idx];
    parentNodes.push(curNode);
  }

  setStatusDown(curNode, status);       // update check status of this node and all childrens, in place

  parentNodes.pop();            // don't need to check this node's level
  updateStatusUp(parentNodes);  // update check status up, from this nodes parent, in place

  return { ...rootNode };
};

export const renameNode = (rootNode, path, newName) => {
  const targetNode = findTargetNode(rootNode, path);
  targetNode.name = newName;

  return { ...rootNode };
};

export const deleteNode = (rootNode, path) => {
  let curNode = rootNode;
  if (path.length === 0) {
    // this is root node
    // just remove every children and reset check status to 0
    curNode.children = [];
    curNode.checked = 0;

    return curNode;
  }

  const parentNodes = [curNode];
  const lastIdx = path.pop();

  for (const idx of path) {
    curNode = curNode.children[idx];
    parentNodes.push(curNode);
  }

  curNode.children.splice(lastIdx, 1);    // remove target node
  updateStatusUp(parentNodes);            // update check status up, from this nodes

  return { ...rootNode };
};

export const addNode = (rootNode, path, hasChildren = false) => {
  const id = findMaxId(rootNode) + 1;

  const targetNode = findTargetNode(rootNode, path);

  const { children } = targetNode;
  if (children) {
    if (!hasChildren) {
      // files goes to front
      children.unshift({
        _id: id,
        name: 'new file',
        checked: Math.floor(targetNode.checked),
      });
    } else {
      // folder goes to back
      children.push({
        _id: id,
        name: 'new folder',
        checked: Math.floor(targetNode.checked),
        children: [],
      });
    }
  } else {
    throw new Error('can\'t add node to a file!!');
  }

  return { ...rootNode };
};

export const toggleOpen = (rootNode, path, isOpen) => {
  const targetNode = findTargetNode(rootNode, path);

  if (targetNode.children) {
    targetNode.isOpen = isOpen;
  } else {
    throw new Error('only parent node (folder) can be opened!!');
  }

  return { ...rootNode };
};

export const setAllOpenStatus = (node, isOpen) => {
  const newNode = { ...node };
  const { children } = newNode;

  if (children) {
    newNode.isOpen = isOpen;
    newNode.children = children.map(child => setAllOpenStatus(child, isOpen));
  }

  return newNode;
};

export const isValidOpenStatus = node => {
  const {
    children,
    isOpen,
  } = node;

  if (children && isOpen === undefined) return false;   // parent node needs to have 'isOpen'
  if (!children && isOpen !== undefined) return false;  // children can't have 'isOpen'

  if (children) {
    for (const child of children) {
      if (!isValidOpenStatus(child)) return false;
    }
  }

  return true;
};

export const getEvent = (eventName, path, ...params) => ({
  type: eventName,
  path,
  params,
});

export const initializeTreeState = (data, initCheckedStatus = 'unchecked', initOpenStatus = 'open') => {
  let initState = initStateWithUniqIds(data);

  switch (initCheckedStatus) {
    case 'unchecked':
      initState = setAllCheckedStatus(initState, 0);
      break;

    case 'checked':
      initState = setAllCheckedStatus(initState, 1);
      break;

    default:
      break;
  }

  switch (initOpenStatus) {
    case 'open':
      initState = setAllOpenStatus(initState, true);
      break;

    case 'closed':
      initState = setAllOpenStatus(initState, false);
      break;

    default:
      if (!isValidOpenStatus(initState)) {
        console.log('custom open status is invalid! Fell back to all opened.');
        initState = setAllOpenStatus(initState, true);
      }
  }

  return initState;
};
