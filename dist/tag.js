import uuid from "uuid/v4";
import * as parse5 from "parse5";
const PARENT_NODES = ["h1", "h2", "h3", "h4", "h5", "p", "span"];
const CONTENT_NODES = ["#text", "img"];
export function parseTags(parseResult) {
    const tags = [];
    const warnings = [];
    const findElements = (node, d = 0) => {
        const { nodeName } = node;
        if (PARENT_NODES.includes(nodeName)) {
            const element = node;
            const attr = element.attrs.find(a => a.name === "t");
            const id = attr ? attr.value : null;
            tags.push({
                id: id || uuid(),
                isNew: !id,
                element,
                n: element.childNodes.map(node => node.value).join(","),
                content: element.childNodes.map(node => parse5.serialize(node)).join("")
            });
            if (!checkContentElements(node)) {
                warnings.push({
                    line: node.__location.line,
                    range: [node.__location.startOffset, node.__location.endOffset],
                    message: "Content should only contain `#text` or `img` nodes."
                });
            }
        }
        else if (d === 0 && CONTENT_NODES.includes(nodeName)) {
            // warnings.push({
            //   line: node.__location!.line,
            //   range: [node.__location!.startOffset, node.__location!.endOffset],
            //   message: "Content without parent element."
            // });
        }
        else {
            const p = node;
            if (p.childNodes) {
                p.childNodes.forEach(c => findElements(c, d + 1));
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
export function applyTags(result) {
    if (result.warnings.length) {
        throw new Error("Fix all warnings first.");
    }
    const tags = result.tags
        .slice(0)
        .sort((a, b) => -(a.element.__location.startOffset - b.element.__location.startOffset));
    let content = result.content;
    for (let tag of tags) {
        if (tag.isNew) {
            parse5.treeAdapters.default.adoptAttributes(tag.element, [
                {
                    name: "t",
                    value: tag.id
                }
            ]);
            const node = parse5.treeAdapters.default.createDocumentFragment();
            parse5.treeAdapters.default.appendChild(node, tag.element);
            content =
                content.slice(0, tag.element.__location.startOffset) +
                    parse5.serialize(node) +
                    content.slice(tag.element.__location.endOffset);
        }
    }
    return content;
}
function checkContentElements(parent) {
    const check = (elem) => {
        if (!elem.childNodes) {
            return true;
        }
        for (let c of elem.childNodes) {
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
//# sourceMappingURL=tag.js.map