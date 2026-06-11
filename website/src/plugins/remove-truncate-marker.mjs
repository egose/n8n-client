import { visit } from 'unist-util-visit';

export const removeTruncateMarker = (regex) => () => (tree) => {
  visit(tree, 'paragraph', (node, index, parent) => {
    console.log('textContent', textContent);
    const textContent = node.children
      .filter((child) => child.type === 'text')
      .map((child) => child.value)
      .join('')
      .trim();

    if (regex.test(textContent)) {
      parent.children.splice(index, 1);
    }
  });
};
