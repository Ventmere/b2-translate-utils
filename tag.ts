import * as huz from "./huz";
import uuid from "uuid/v4";
import * as parse5 from "parse5";
const treeAdapters: parse5.TreeAdapter = require("parse5/lib/tree-adapters/default");

const PARENT_NODES: string[] = ["h1", "h2", "h3", "h4", "h5", "p", "span"];
const CONTENT_NODES: string[] = ["#text", "img"];

export interface IParseTagsResult {
  content: string;
  tags: ITag[];
  warnings: ITagWarning[];
}

export function parseTags(parseResult: huz.IParseResult): IParseTagsResult {
  const tags: ITag[] = [];
  const warnings: ITagWarning[] = [];
  const findElements = (node: huz.Node, d = 0) => {
    const { nodeName } = node;
    if (PARENT_NODES.includes(nodeName)) {
      const element = node as huz.Element;
      const attr = element.attrs.find(a => a.name === "t");
      const id = attr ? attr.value : null;
      const serNode = treeAdapters.createDocumentFragment();
      for (let c of (node as parse5.DefaultTreeParentNode).childNodes) {
        treeAdapters.appendChild(serNode, c);
      }
      tags.push({
        id: id || uuid(),
        isNew: !id,
        element,
        n: element.childNodes.map(node => (node as any).value).join(","),
        content: parse5.serialize(serNode)
      } as any);
      if (!checkContentElements(node as huz.Element)) {
        warnings.push({
          line: node.sourceCodeLocation!.startLine,
          range: [
            node.sourceCodeLocation!.startOffset,
            node.sourceCodeLocation!.endOffset
          ],
          message: "Content should only contain `#text` or `img` nodes."
        });
      }
    } else if (d === 0 && CONTENT_NODES.includes(nodeName)) {
      // warnings.push({
      //   line: node.__location!.line,
      //   range: [node.__location!.startOffset, node.__location!.endOffset],
      //   message: "Content without parent element."
      // });
    } else {
      const p = node as huz.Element;
      if (p.childNodes) {
        p.childNodes.forEach(c => findElements(c as huz.Node, d + 1));
      }
    }
  };
  parseResult.htmlRoot.childNodes.forEach(c => findElements(c));
  return {
    content: parseResult.content,
    tags,
    warnings
  };
}

export function applyTags(result: IParseTagsResult): string {
  if (result.warnings.length) {
    throw new Error("Fix all warnings first.");
  }
  const tags = result.tags
    .slice(0)
    .sort(
      (a, b) =>
        -(
          a.element.sourceCodeLocation!.startOffset -
          b.element.sourceCodeLocation!.startOffset
        )
    );
  let content = result.content;
  for (let tag of tags) {
    if (tag.isNew) {
      treeAdapters.adoptAttributes(tag.element, [
        {
          name: "t",
          value: tag.id
        }
      ]);
      const node = treeAdapters.createDocumentFragment();
      treeAdapters.appendChild(node, tag.element);
      content =
        content.slice(0, tag.element.sourceCodeLocation!.startOffset) +
        parse5.serialize(node) +
        content.slice(tag.element.sourceCodeLocation!.endOffset);
    }
  }
  return content;
}

function checkContentElements(parent: huz.Element): boolean {
  const check = (elem: huz.Element) => {
    if (!elem.childNodes) {
      return true;
    }
    for (let c of elem.childNodes as huz.Element[]) {
      if (!CONTENT_NODES.includes(c.nodeName)) {
        return false;
      }
      if (!check(c)) {
        return false;
      }
    }
    return true;
  };
  return check(parent);
}

export interface ITag {
  id: string;
  isNew: boolean;
  element: huz.Element;
  content: string;
}

export interface ITagWarning {
  line: number;
  range: [number, number];
  message: string;
}
