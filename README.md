# Use Tree State
A super-light and customizable React hook to manage tree state like never before. It supports:  
✔️ built in CRUD handlers: add, modify, and delete tree nodes with 1 line of code  
✔️ custom handlers: define any custom state transition for your need  
✔️ half check (indeterminate check): auto calculate corresponding checked status for all nodes
✔️ tree state onChange listener

An example package that uses this hook internally can be found [here](https://www.npmjs.com/package/react-folder-tree).

## Usage
### 🌀 install
```bash
$ yarn add use-tree-state
$ npm install use-tree-state --save
```

### 🌀 initialization
```ts
import useTreeState, { testData } from 'use-tree-state';

const TreeApp = () => {
  const { treeState } = useTreeState({ data: testData });

  return (<Tree state={ treeState } />);
};
```

### 🌀 custom initialization
Tree state data is an object that descibes a nested tree node structure. There are a couple reserved keys for internal use:
- **name**(string): node's name
- **checked**(1 | 0 | 0.5): checked status, 1 for checked, 0 for unchecked, 0.5 for half checked
- **isOpen**(bool): can we see it's children (parant node only)
- **children**(array): this node's children (parent node only)
- **_id**(int): internal id

We can use any other keys to carry extra info about this node, such as url, type, nickname...

An example state looks like
```jsx
{
  // reserved keys
  name: 'root node',   
  checked (optional): 0 (unchecked, default) | 0.5 (half checked) | 1 (checked),
  isOpen (optional): false (default) | true,
  children (optional): [array of tree node],

  // not reserved
  nickname (optional): 'Goku',
  url (optional): 'www.dragonball.com',
}
```

We can pass in options to specify how to auto initialize `checked`/`isOpen` status for all nodes.

If we pass in `data` with custom state (not all nodes have the same `checked`/`isOpen` status), please specify `custom` for these status, otherwise custom state will be overwrote by the default option.
```ts
const { treeState } = useTreeState({
  data: testData,
  options: {
    initCheckedStatus: 'checked',   // 'unchecked' (default) | 'checked' | 'custom'
    initOpenStatus: 'open',         // 'open' (default) | 'closed' | 'custom'
  }
});
```

### 🌀 update tree state
There are a couple built in tree state reducers that can be used to updateFor tree state conveniently.

For more details please refer to [Built-in Reducers](#built-in-reducers) section.
```ts
const TreeApp = () => {
  const { treeState, reducers } = useTreeState({ data: testData });
  const {
    checkNode,
    toggleOpen,
    renameNode,
    deleteNode,
    addNode,
  } = reducers;

  return (<>
    <Button onClick={ () => checkNode([0]) }>
      check the first node
    </Button>

    <Button onClick={ () => toggleOpen([0], 1) }>
      open the first parent node
    </Button>

    <Button onClick={ () => toggleOpen([1], 0) }>
      close the second parent node
    </Button>

    <Button onClick={ () => renameNode([2], 'pikachu') }>
      rename the third node to pikachu
    </Button>

    <Button onClick={ () => deleteNode([3]) }>
      remove the fourth node
    </Button>

    <Button onClick={ () => addNode([], false) }>
      add a leaf node as root node's children
    </Button>

    <Button onClick={ () => addNode([], true) }>
      add a parent node as root node's children
    </Button>

    <Tree state={ treeState } />
  </>);
};
```

### 🌀 onChange listener
we can pass in an `onChange(newState: tree-state-obj, event: obj)` to the hook to listen for state change event.
```ts
const handleStateChange = (newState, event) => {
  const { type, path, params } = event;

  console.log('last event: ', { type, path, params });
  console.log('state changed to: ', newState);
};

const { treeState } = useTreeState({
  data: testData,
  onChange: handleStateChange,      // <== here!!
});
```


## Built-in Reducers
All built in reducers will use `path` param to find the tree node to operate on. `path` is an array of indexes from root to the target node.

An example that shows each node and corresponding path
```ts
const treeState = {
  name: 'root',         // path = []
  children: [
    { name: 'node_0' }    // path = [0]
    { name: 'node_1' }    // path = [1]
    {
      name: 'node_2',     // path = [2]
      children: [
        { name: 'node_2_0' },   // path = [2, 0]
        { name: 'node_2_1' },   // path = [2, 1]
      ],
    }
  ],
};
```

### • `reducers.checkNode(path: array)`
Check a target node (internally set `checked` = 1), if target node is already checked, this will uncheck it (internally set `checked` = 0).

It will also update checked status for all other nodes:
- if we checked a parent node, all children nodes will also be checked
- if some (but not all) of a node's children are checked, this node becomes half check (internally set `checked` = 0.5)
### • `reducers.toggleOpen(path: array, isOpen: bool)`
Set the open status for a parent node. `open: false` usually means in UI we shouldn't see it's children.

**This only works for parent nodes**, which are the nodes that has `children` in tree state.

### • `reducers.renameNode(path: array, newName: string)`
You know what it is.

### • `reducers.deleteNode(path: array)`
Delete the target node. If target node is a parent, all of it's children will also be removed.

### • `reducers.addNode(path: array, hasChildren: bool)`
Add a node as a children of target node. `hasChildren: true` means this new node is a parent node, otherwise it is a leaf node.

**This only works for parent nodes**.

### • `reducers.setTreeState(newState: tree-state-object)`
Instead of 'update' the tree state, this will set whole tree state directly. (n)

## Custom Reducers
There are two ways to build custom state transition functions. We provided a `findTargetNode` util to help find the target node.

### 🌀 wrap custom reducer in the hook
We can build any custom reducers of format `myReducer(root: tree-state-obj, path: array | null, ...params): tree-state`, then pass it to the hook constructor. Hook will wrap it internally, and then we can use it like `reducers.myReducer(path: array | null, ...params)` to update the treeState. 
```ts
import useTreeState, {
  testData,
  findTargetNode,
} from 'use-tree-state';

const TreeApp = () => {
  // our custom reducer
  const renameToPikachuNTimes = (root, path, n) => {
    const targetNode = findTargetNode(root, path);
    targetNode.name = 'pika'.repeat(n);

    return { ...root };
  };

  const { treeState, reducers } = useTreeState({
    data: testData,
    customReducers: {
      renameToPikachuNTimes,  // pass in and hook will wrap it
    },
  });

  const renameFirstNodeToPikaPikaPika = () => {
    // use the wrapped custom reducer
    reducers.renameToPikachuNTimes([0], 3);
  }

  return (<>
    <Button onClick={ renameFirstNodeToPikaPikaPika }>
      pika pika
    </Button>

    <Tree state={ treeState } />
  </>);

};
```

### 🌀 set tree state from outside
This way is **not recommended**, didn't test it.
```ts
const TreeApp = () => {
  const { treeState, reducers } = useTreeState({ data: testData });
  const { setTreeState } = reducers;

  // our custom reducer to set tree state directly
  const renameToPikachuNTimes = (root, path, n) => {
    // treeState is a ref to the internal state
    // shouldn't alter it directly
    const newState = deepClone(root); 

    const targetNode = findTargetNode(newState, path);
    targetNode.name = 'pika'.repeat(n);

    setTreeState(newState);
  };

  const renameFirstNodeToPikaPikaPika = () => {
    renameToPikachuNTimes(treeState, [0], 3);
  }

  return (<>
    <Button onClick={ renameFirstNodeToPikaPikaPika }>
      pika pika
    </Button>

    <Tree state={ treeState } />
  </>);
};
```

### find node by name
We chose to use path to find target node as the primary interface because:
- path is always uniq
- this is the fastest way to find a target node
- we can dynamically general path in <Tree /> component that uses this hook, which perfectly matches the reducer API. [example](https://github.com/shunjizhan/react-folder-tree/blob/master/src/components/TreeNode/TreeNode.jsx#L30)

However, we can easily implement custom reducer to use other props (such as name) to find a target node. We provided a util ` (propName: string, targetValue: string): array` to help achieve this.
```ts
import { findTargetPathByProp } from 'use-tree-state';

const renameToPikachuNTimes = (root, targetName, n) => {
  const path = findTargetPathByProp('name', targetName);    // <== here!!!

  // rest is just the same
  const targetNode = findTargetNode(root, path);
  targetNode.name = 'pika'.repeat(n);

  return { ...root };
};

// ......
```

## Bugs? Questions? Contributions?
Feel free to [open an issue](https://github.com/shunjizhan/use-tree-state/issues), or create a pull request!