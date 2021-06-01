import {
  testData,
  testDataWithId,
  initializedTestData,
} from './testData';
import {
  deepClone,
  findTargetNode,
  initStateWithUniqIds,
  checkNode,
  setAllCheckedStatus,
  getNewCheckStatus,
  toggleOpen,
  setAllOpenStatus,
  isValidOpenStatus,
  renameNode,
  deleteNode,
  findMaxId,
  addNode,
  getEvent,
  initializeTreeState,
} from '../utils';

describe('initStateWithUniqIds', () => {
  it('add uniq ids to all nodes', () => {
    expect(initStateWithUniqIds(deepClone(testData))).toEqual(testDataWithId);
    expect(initStateWithUniqIds({})).toEqual({ _id: 0 });
  });
});

describe('initializeTreeState', () => {
  test('correctly intialize tree state', () => {
    expect(initializeTreeState(deepClone(testData))).toEqual(initializedTestData);
  });

  test('with invalid custom options', () => {
    expect(initializeTreeState(deepClone(testData), 'unchecked', 'custom')).toEqual(initializedTestData);
  });

  test('with valid custom options', () => {
    expect(initializeTreeState(deepClone(initializedTestData), 'custom', 'custom')).toEqual(initializedTestData);
  });
});

describe('setAllCheckedStatus', () => {
  const initData = setAllOpenStatus(setAllCheckedStatus(initStateWithUniqIds(deepClone(testData)), 0), true);

  it('set checked status to 0 for all nodes', () => {
    expect(initData).toEqual(initializedTestData);
  });
});

describe('getNewCheckStatus', () => {
  describe('when node is a leaf', () => {
    it('returns correct state', () => {
      expect(getNewCheckStatus({ checked: 1 })).toEqual(1);
      expect(getNewCheckStatus({ checked: 0 })).toEqual(0);
    });
  });

  describe('when node is a parent with empty children list', () => {
    it('returns correct state', () => {
      expect(getNewCheckStatus({ checked: 1, children: [] })).toEqual(1);
      expect(getNewCheckStatus({ checked: 0, children: [] })).toEqual(0);
    });
  });

  describe('when new check status should be 0', () => {
    const node = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
        { checked: 0 },
      ],
    };
    it('returns correct state', () => {
      expect(getNewCheckStatus(node)).toEqual(0);
    });
  });

  describe('when new check status should be 1', () => {
    const node = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
        { checked: 1 },
      ],
    };
    it('returns correct state', () => {
      expect(getNewCheckStatus(node)).toEqual(1);
    });
  });

  describe('when new check status should be 0.5', () => {
    const node = {
      checked: 0.5,
      children: [
        { checked: 0 },
        { checked: 1 },
        { checked: 1 },
      ],
    };
    it('returns correct state', () => {
      expect(getNewCheckStatus(node)).toEqual(0.5);
    });
  });
});

describe('checkNode', () => {
  const initData = setAllCheckedStatus(initStateWithUniqIds(deepClone(testData)), 0);

  describe('when check root node', () => {
    it('returns correct state', () => {
      expect(checkNode(initData, [], 1)).toEqual(setAllCheckedStatus(initData, 1));
      expect(checkNode(initData, [], 0)).toEqual(setAllCheckedStatus(initData, 0));
    });
  });

  describe('when check other nodes', () => {
    describe('when parent becomes 1', () => {
      const node = {
        checked: 0.5,
        children: [
          { checked: 0 },
          { checked: 1 },
          { checked: 1 },
        ],
      };
      const expected = {
        checked: 1,
        children: [
          { checked: 1 },
          { checked: 1 },
          { checked: 1 },
        ],
      };
      it('returns correct state', () => {
        expect(checkNode(node, [0], 1)).toEqual(expected);
      });
    });

    describe('when parent becomes 0', () => {
      const node = {
        checked: 0.5,
        children: [
          { checked: 0 },
          { checked: 1 },
          { checked: 0 },
        ],
      };
      const expected = {
        checked: 0,
        children: [
          { checked: 0 },
          { checked: 0 },
          { checked: 0 },
        ],
      };
      it('returns correct state', () => {
        expect(checkNode(node, [1], 0)).toEqual(expected);
      });
    });

    describe('when parent becomes 0.5', () => {
      const node = {
        checked: 0,
        children: [
          { checked: 0 },
          { checked: 0 },
          { checked: 0 },
        ],
      };
      const expected = {
        checked: 0.5,
        children: [
          { checked: 0 },
          { checked: 0 },
          { checked: 1 },
        ],
      };

      it('returns correct state', () => {
        expect(checkNode(node, [2], 1)).toEqual(expected);
      });
    });

    describe('when parent does not change', () => {
      const node = {
        checked: 0.5,
        children: [
          { checked: 1 },
          { checked: 0 },
          { checked: 0 },
        ],
      };
      const expected = {
        checked: 0.5,
        children: [
          { checked: 1 },
          { checked: 0 },
          { checked: 1 },
        ],
      };
      it('returns correct state', () => {
        expect(checkNode(node, [2], 1)).toEqual(expected);
      });
    });
  });
});

describe('toggleOpen', () => {
  const node = {
    name: 'root',
    isOpen: false,
    children: [
      { name: 'x' },
      { name: 'y' },
      {
        name: 'z',
        isOpen: true,
        children: [
          { name: 'a', isOpen: true, children: [] },
          { name: 'b' },
        ],
      },
    ],
  };

  it('throw error for file component', () => {
    try {
      toggleOpen(node, [0], true);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }

    try {
      toggleOpen(node, [1], false);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }

    try {
      toggleOpen(node, [2, 1], true);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }
  });

  it('correctly toggle first layer', () => {
    const expected = {
      name: 'root',
      isOpen: true,
      children: [
        { name: 'x' },
        { name: 'y' },
        {
          name: 'z',
          isOpen: true,
          children: [
            { name: 'a', isOpen: true, children: [] },
            { name: 'b' },
          ],
        },
      ],
    };

    expect(toggleOpen(deepClone(node), [], true)).toEqual(expected);
    expect(toggleOpen(deepClone(expected), [], false)).toEqual(node);
  });

  it('correctly toggle second layer', () => {
    const expected = {
      name: 'root',
      isOpen: false,
      children: [
        { name: 'x' },
        { name: 'y' },
        {
          name: 'z',
          isOpen: false,
          children: [
            { name: 'a', isOpen: true, children: [] },
            { name: 'b' },
          ],
        },
      ],
    };

    expect(toggleOpen(deepClone(node), [2], false)).toEqual(expected);
    expect(toggleOpen(deepClone(expected), [2], true)).toEqual(node);
  });

  it('correctly toggle last layer', () => {
    const expected = {
      name: 'root',
      isOpen: false,
      children: [
        { name: 'x' },
        { name: 'y' },
        {
          name: 'z',
          isOpen: true,
          children: [
            { name: 'a', isOpen: false, children: [] },
            { name: 'b' },
          ],
        },
      ],
    };

    expect(toggleOpen(deepClone(node), [2, 0], false)).toEqual(expected);
    expect(toggleOpen(deepClone(expected), [2, 0], true)).toEqual(node);
  });
});

describe('setAllOpenStatus', () => {
  const nodeWithIsOpen = {
    name: 'root',
    isOpen: false,
    children: [
      { name: 'x' },
      { name: 'y' },
      {
        name: 'z',
        isOpen: true,
        children: [
          { name: 'a', isOpen: false, children: [] },
          { name: 'b' },
        ],
      },
    ],
  };

  const nodeWithOutIsOpen = {
    name: 'root',
    children: [
      { name: 'x' },
      { name: 'y' },
      {
        name: 'z',
        children: [
          { name: 'a', children: [] },
          { name: 'b' },
        ],
      },
    ],
  };

  it('set isOpen = true for all nodes', () => {
    const expected = {
      name: 'root',
      isOpen: true,
      children: [
        { name: 'x' },
        { name: 'y' },
        {
          name: 'z',
          isOpen: true,
          children: [
            { name: 'a', isOpen: true, children: [] },
            { name: 'b' },
          ],
        },
      ],
    };

    expect(setAllOpenStatus(nodeWithIsOpen, true)).toEqual(expected);
    expect(setAllOpenStatus(nodeWithOutIsOpen, true)).toEqual(expected);
  });
});

describe('isValidOpenStatus', () => {
  describe('when open status is valid', () => {
    it('returns true', () => {
      const valid1 = {
        isOpen: false,
        children: [],
      };

      const valid2 = {
        isOpen: false,
        children: [
          {
            isOpen: true,
            children: [
              {},
              {},
            ],
          },
        ],
      };

      const valid3 = {
        isOpen: false,
        children: [
          {},
          {},
          {
            isOpen: true,
            children: [
              { isOpen: true, children: [] },
              {},
            ],
          },
        ],
      };

      expect(isValidOpenStatus(valid1)).toEqual(true);
      expect(isValidOpenStatus(valid2)).toEqual(true);
      expect(isValidOpenStatus(valid3)).toEqual(true);
    });
  });

  describe('when open status is not valid', () => {
    it('returns false', () => {
      const inValid1 = {
        children: [],
      };

      const inValid2 = {
        isOpen: false,
      };

      const inValid3 = {
        isOpen: false,
        children: [
          {
            isOpen: true,
            children: [
              { children: [] },
              {},
            ],
          },
        ],
      };
      const inValid4 = {
        isOpen: false,
        children: [
          {
            isOpen: true,
            children: [
              { isOpen: false },
              {},
            ],
          },
        ],
      };

      expect(isValidOpenStatus(inValid1)).toEqual(false);
      expect(isValidOpenStatus(inValid2)).toEqual(false);
      expect(isValidOpenStatus(inValid3)).toEqual(false);
      expect(isValidOpenStatus(inValid4)).toEqual(false);
    });
  });
});

describe('renameNode', () => {
  const node = {
    name: 'x',
    children: [
      { name: 'y' },
      { name: 'z' },
      {
        name: 'a',
        children: [
          { name: 'b' },
          { name: 'c' },
        ],
      },
    ],
  };

  const newName = 'RR';

  it('rename first level correctly', () => {
    const newNode = deepClone(node);
    newNode.name = newName;
    expect(renameNode(node, [], newName)).toEqual(newNode);
  });

  it('rename second level correctly', () => {
    const newNode = deepClone(node);
    newNode.children[1].name = newName;
    expect(renameNode(node, [1], newName)).toEqual(newNode);
  });

  it('rename last level correctly', () => {
    const newNode = deepClone(node);
    newNode.children[2].children[0].name = newName;
    expect(renameNode(node, [2, 0], newName)).toEqual(newNode);
  });
});

describe('deleteNode', () => {
  describe('when deleting root node', () => {
    it('remove all it\'s children and reset checked status to 0', () => {
      const node = {
        checked: 1,
        children: [
          { checked: 1 },
          { checked: 1 },
          {
            checked: 1,
            children: [
              { checked: 1 },
              { checked: 1 },
            ],
          },
        ],
      };

      const expected = {
        checked: 0,
        children: [],
      };

      expect(deleteNode(node, [])).toEqual(expected);
    });

    it('remove all it\'s children and reset checked status to 0', () => {
      const node = {
        checked: 0,
        children: [
          { checked: 0 },
          { checked: 0 },
          {
            checked: 0,
            children: [
              { checked: 0 },
              { checked: 0 },
            ],
          },
        ],
      };

      const expected = {
        checked: 0,
        children: [],
      };

      expect(deleteNode(node, [])).toEqual(expected);
    });

    it('remove all it\'s children and reset checked status to 0', () => {
      const node = {
        checked: 0.5,
        children: [
          { checked: 1 },
          { checked: 0 },
          {
            checked: 0.5,
            children: [
              { checked: 1 },
              { checked: 0 },
            ],
          },
        ],
      };

      const expected = {
        checked: 0,
        children: [],
      };

      expect(deleteNode(node, [])).toEqual(expected);
    });
  });

  describe('when parent state doesn\'t change case 1', () => {
    const node = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
        {
          checked: 1,
          children: [
            { checked: 1 },
            { checked: 1 },
          ],
        },
      ],
    };

    const state1 = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
        {
          checked: 1,
          children: [
            { checked: 1 },
          ],
        },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(node, [2, 1])).toEqual(state1);
    });

    const state2 = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
        {
          checked: 1,
          children: [],
        },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(state1, [2, 0])).toEqual(state2);
    });

    const state3 = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(state2, [2])).toEqual(state3);
    });
  });

  describe('when parent state doesn\'t change case 0', () => {
    const node = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
        {
          checked: 0,
          children: [
            { checked: 0 },
            { checked: 0 },
          ],
        },
      ],
    };

    const state1 = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
        {
          checked: 0,
          children: [
            { checked: 0 },
          ],
        },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(node, [2, 1])).toEqual(state1);
    });

    const state2 = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
        {
          checked: 0,
          children: [],
        },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(state1, [2, 0])).toEqual(state2);
    });

    const state3 = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(state2, [2])).toEqual(state3);
    });
  });

  describe('when parent state change to 1', () => {
    const node = {
      checked: 0.5,
      children: [
        { checked: 1 },
        { checked: 1 },
        {
          checked: 0.5,
          children: [
            { checked: 1 },
            { checked: 0 },
            { checked: 1 },
          ],
        },
      ],
    };

    const expected = {
      checked: 1,
      children: [
        { checked: 1 },
        { checked: 1 },
        {
          checked: 1,
          children: [
            { checked: 1 },
            { checked: 1 },
          ],
        },
      ],
    };

    it('returns correct state', () => {
      expect(deleteNode(node, [2, 1])).toEqual(expected);
    });
  });

  describe('when parent state change to 0', () => {
    const node = {
      checked: 0.5,
      children: [
        { checked: 0 },
        { checked: 0 },
        {
          checked: 0.5,
          children: [
            { checked: 0 },
            { checked: 0 },
            { checked: 1 },
          ],
        },
      ],
    };

    const expected = {
      checked: 0,
      children: [
        { checked: 0 },
        { checked: 0 },
        {
          checked: 0,
          children: [
            { checked: 0 },
            { checked: 0 },
          ],
        },
      ],
    };
    it('returns correct state', () => {
      expect(deleteNode(node, [2, 2])).toEqual(expected);
    });
  });
});

describe('findMaxId', () => {
  it('finds correct max id', () => {
    const node = {
      _id: 1,
      children: [
        { _id: 2 },
        { _id: 3 },
        {
          _id: 4,
          children: [
            { _id: 5 },
            { _id: 6 },
            { _id: 7 },
          ],
        },
      ],
    };
    expect(findMaxId(node)).toEqual(7);

    node._id = 15;
    expect(findMaxId(node)).toEqual(15);

    node.children[1]._id = 18;
    expect(findMaxId(node)).toEqual(18);

    node.children[2].children[1]._id = 27;
    expect(findMaxId(node)).toEqual(27);

    node.children.push({ _id: 30 });
    expect(findMaxId(node)).toEqual(30);

    node.children.pop();
    expect(findMaxId(node)).toEqual(27);

    node.children.shift();
    expect(findMaxId(node)).toEqual(27);
  });
});

describe('addNode', () => {
  describe('when parent folder is checked', () => {
    const node = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 1,
          _id: 3,
          children: [
            { checked: 1, _id: 100 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFileExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 1,
          _id: 3,
          children: [
            { checked: 1, _id: 101, name: 'new file' },
            { checked: 1, _id: 100 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFolderExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 1,
          _id: 3,
          children: [
            { checked: 1, _id: 100 },
            {
              checked: 1, _id: 101, name: 'new folder', children: [],
            },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    expect(addNode(deepClone(node), [1], false)).toEqual(addFileExpected);
    expect(addNode(deepClone(node), [1], true)).toEqual(addFolderExpected);
  });

  describe('when parent folder is half-checked', () => {
    const node = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0.5,
          _id: 3,
          children: [
            { checked: 1, _id: 100 },
            { checked: 0, _id: 101 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFileExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0.5,
          _id: 3,
          children: [
            { checked: 0, _id: 102, name: 'new file' },
            { checked: 1, _id: 100 },
            { checked: 0, _id: 101 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFolderExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0.5,
          _id: 3,
          children: [
            { checked: 1, _id: 100 },
            { checked: 0, _id: 101 },
            {
              checked: 0, _id: 102, name: 'new folder', children: [],
            },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    expect(addNode(deepClone(node), [1], false)).toEqual(addFileExpected);
    expect(addNode(deepClone(node), [1], true)).toEqual(addFolderExpected);
  });

  describe('when parent folder is unchecked', () => {
    const node = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0,
          _id: 3,
          children: [
            { checked: 0, _id: 100 },
            { checked: 0, _id: 101 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFileExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0,
          _id: 3,
          children: [
            { checked: 0, _id: 102, name: 'new file' },
            { checked: 0, _id: 100 },
            { checked: 0, _id: 101 },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    const addFolderExpected = {
      checked: 0.5,
      _id: 1,
      children: [
        { checked: 0, _id: 2 },
        {
          checked: 0,
          _id: 3,
          children: [
            { checked: 0, _id: 100 },
            { checked: 0, _id: 101 },
            {
              checked: 0, _id: 102, name: 'new folder', children: [],
            },
          ],
        }, {
          checked: 0.5,
          _id: 9,
          children: [
            { checked: 0, _id: 11 },
            { checked: 1, _id: 18 },
            { checked: 0, _id: 84 },
          ],
        },
      ],
    };

    expect(addNode(deepClone(node), [1], false)).toEqual(addFileExpected);
    expect(addNode(deepClone(node), [1], true)).toEqual(addFolderExpected);
  });

  describe('when adding node to a file', () => {
    it('throws correct message', () => {
      const node = {
        _id: 1,
        children: [
          { _id: 2 },
        ],
      };
      try {
        addNode(deepClone(node), [0], false);
      } catch (e) {
        expect(e.message).toEqual('can\'t add node to a file!!');
      }
    });
  });
});

describe('findTargetNode', () => {
  describe('valid path', () => {
    it('returns correct node', () => {
      expect(findTargetNode(testData, [])).toEqual(testData);
      expect(findTargetNode(testData, [2])).toEqual(testData.children[2]);
      expect(findTargetNode(testData, [3, 1])).toEqual(testData.children[3].children[1]);
    });
  });

  describe('invalid path', () => {
    it('throws correct message', () => {
      expect(
        () => findTargetNode(testData, [1000]),
      ).toThrowError('finding node failed: invalid path!!');

      expect(
        () => findTargetNode(testData, [3, 932]),
      ).toThrowError('finding node failed: invalid path!!');

      expect(
        () => findTargetNode(testData, [-1]),
      ).toThrowError('finding node failed: invalid path!!');
    });
  });
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
