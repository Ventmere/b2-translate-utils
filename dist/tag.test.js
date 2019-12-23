"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const huz = __importStar(require("./huz"));
const tag = __importStar(require("./tag"));
const HTML_SAMPLE = fs.readFileSync(path.join(__dirname, "./samples/sample2.html"), "utf-8");
const HTML_SAMPLE_TAGGED = fs.readFileSync(path.join(__dirname, "./samples/sample2-tagged.html"), "utf-8");
test("tags", () => {
    const r = huz.parse(HTML_SAMPLE);
    const tagr = tag.parseTags(r);
    expect(tagr.warnings).toEqual([]);
    tagr.tags.forEach((t, i) => {
        if (t.isNew) {
            t.id = `tag_${i}`;
        }
    });
    expect(tag.applyTags(tagr)).toEqual(HTML_SAMPLE_TAGGED);
});
//# sourceMappingURL=tag.test.js.map