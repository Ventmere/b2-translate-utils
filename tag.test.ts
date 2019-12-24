import * as fs from "fs";
import * as path from "path";

import * as huz from "./huz";
import * as tag from "./tag";

const HTML_SAMPLE = fs.readFileSync(
  path.join(__dirname, "./samples/sample2.html"),
  "utf-8"
);
const HTML_SAMPLE_TAGGED = fs.readFileSync(
  path.join(__dirname, "./samples/sample2-tagged.html"),
  "utf-8"
);

test("tags", () => {
  const r = huz.parse(HTML_SAMPLE);
  const tagr = tag.parseTags(r);
  console.log(tagr.tags.map(t => t.content));
  expect(tagr.warnings).toEqual([]);

  tagr.tags.forEach((t, i) => {
    if (t.isNew) {
      t.id = `tag_${i}`;
    }
  });
  expect(tag.applyTags(tagr)).toEqual(HTML_SAMPLE_TAGGED);
});

export {};
