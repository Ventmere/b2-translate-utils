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
const HTML_SAMPLE1 = fs.readFileSync(path.join(__dirname, "./samples/sample1.html"), "utf-8");
test("parse huz deps", () => {
    const r = huz.parse(HTML_SAMPLE1);
    expect(r.handles).toEqual([
        "layout-product-layout",
        "lib:component-layout-full-bg-video",
        "lib:r1280db-1",
        "lib:r1280db-2",
        "lib:r1280db-3",
        "lib:feature-icon-bluetooth-77",
        "lib:feature-icon-RCA",
        "lib:feature-icon-3-5mm-aux",
        "lib:feature-icon-optical-digital"
    ]);
});
//# sourceMappingURL=huz.test.js.map