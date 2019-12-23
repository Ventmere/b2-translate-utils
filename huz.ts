import * as parse5 from "parse5";
const huz = require("huz");

export type TextNode = parse5.DefaultTreeTextNode;
export type Element = parse5.DefaultTreeElement;
export type Node = Element | TextNode;
export type Root = {
  childNodes: Node[];
};

export interface IParseResult {
  content: string;
  htmlRoot: Root;
  handles: string[];
}

export interface IPlaceholder {
  char: string;
  offset: number;
}

export function parse(content: string): IParseResult {
  const r = /(?<={{\s*)([<>])/g;
  const placeholders: IPlaceholder[] = [];
  searchAll(content, r, (i, _, c) => {
    placeholders.push({
      char: c[0],
      offset: i
    });
  });
  const deps = parseHuzDeps(content);
  let patched = content;
  for (let { offset } of placeholders) {
    patched = patched.slice(0, offset) + "!" + patched.slice(offset + 1);
  }
  const htmlRoot = parse5.parseFragment(patched, {
    sourceCodeLocationInfo: true
  }) as Root;
  unpatch(htmlRoot, placeholders);
  return {
    content,
    htmlRoot,
    handles: deps.map(d => d.name)
  };
}

export function serialize(node: parse5.Node): string {
  return parse5.serialize(node);
}

function unpatch(htmlRoot: Root, placeholders: IPlaceholder[]) {
  const textNodes: TextNode[] = [];
  const getTextNodes = (node: any) => {
    if (node.nodeName === "#text") {
      textNodes.push(node);
    } else {
      if (node.childNodes) {
        node.childNodes.forEach(getTextNodes);
      }
    }
  };
  htmlRoot.childNodes.forEach(getTextNodes);
  for (let p of placeholders) {
    const node = textNodes.find(
      n =>
        n.sourceCodeLocation!.startOffset <= p.offset &&
        n.sourceCodeLocation!.endOffset >= p.offset
    );
    if (!node) {
      throw new Error(
        `pleace holder not found in html text node: char = '${p.char}', offset = '${p.offset}'`
      );
    }
    const nodeOffset = p.offset - node.sourceCodeLocation!.startOffset;
    node.value =
      node.value.slice(0, nodeOffset) + p.char + node.value.slice(nodeOffset);
  }
}

interface IHuzRef {
  type: "layout" | "partial";
  name: string;
  location: [number, number];
}

function parseHuzDeps(content: string) {
  const root = huz.parse(content);
  const refs: IHuzRef[] = [];
  const parseAstRefs = (node: any) => {
    const { type, location } = node;
    switch (type) {
      case "ROOT": {
        return node.children.forEach(parseAstRefs);
      }
      case "Inheritance.PARENT": {
        const openToken = node.tokens[0];
        refs.push({
          type: "layout",
          name: node.name,
          location: [openToken.location.index, openToken.location.endIndex]
        });
        return node.children.forEach(parseAstRefs);
      }
      case "Inheritance.BLOCK": {
        return node.children.forEach(parseAstRefs);
      }
      case "PARTIAL": {
        refs.push({
          type: "partial",
          name: node.name,
          location: [location.index, location.endIndex]
        });
        return;
      }
      case "SECTION": {
        return node.children.forEach(parseAstRefs);
      }
    }
  };
  parseAstRefs(root);
  return refs;
}

export function searchAll<T>(
  str: string,
  re: RegExp,
  extract: (index: number, length: number, captures: string[]) => T
): T[] {
  re.lastIndex = 0;
  const result = [];
  let match;
  while ((match = re.exec(str)) != null) {
    result.push(extract(match.index, match[0].length, match.slice(1)));
  }
  re.lastIndex = 0;
  return result;
}
