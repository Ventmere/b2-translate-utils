import * as fs from "fs";
import * as path from "path";

import * as huz from "./huz";

const HTML_SAMPLE1 = fs.readFileSync(
  path.join(__dirname, "../samples/sample1.html"),
  "utf-8"
);

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

export {};
