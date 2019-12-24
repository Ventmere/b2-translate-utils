"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const v4_1 = __importDefault(require("uuid/v4"));
const parse5 = __importStar(require("parse5"));
const treeAdapters = require("parse5/lib/tree-adapters/default");
const PARENT_NODES = ["h1", "h2", "h3", "h4", "h5", "p", "span"];
const CONTENT_NODES = ["#text", "img"];
function parseTags(parseResult) {
    const tags = [];
    const warnings = [];
    const findElements = (node, d = 0) => {
        const { nodeName } = node;
        if (PARENT_NODES.includes(nodeName)) {
            const element = node;
            const attr = element.attrs.find(a => a.name === "t");
            const id = attr ? attr.value : null;
            const serNode = treeAdapters.createDocumentFragment();
            for (let c of node.childNodes) {
                treeAdapters.appendChild(serNode, c);
            }
            tags.push({
                id: id || v4_1.default(),
                isNew: !id,
                element,
                n: element.childNodes.map(node => node.value).join(","),
                content: parse5.serialize(serNode)
            });
            if (!checkContentElements(node)) {
                warnings.push({
                    line: node.sourceCodeLocation.startLine,
                    range: [
                        node.sourceCodeLocation.startOffset,
                        node.sourceCodeLocation.endOffset
                    ],
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
exports.parseTags = parseTags;
function applyTags(result) {
    if (result.warnings.length) {
        throw new Error("Fix all warnings first.");
    }
    const tags = result.tags
        .slice(0)
        .sort((a, b) => -(a.element.sourceCodeLocation.startOffset -
        b.element.sourceCodeLocation.startOffset));
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
                content.slice(0, tag.element.sourceCodeLocation.startOffset) +
                    parse5.serialize(node) +
                    content.slice(tag.element.sourceCodeLocation.endOffset);
        }
    }
    return content;
}
exports.applyTags = applyTags;
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