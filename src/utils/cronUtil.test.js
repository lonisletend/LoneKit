import test from "node:test";
import assert from "node:assert/strict";
import {
  convertCronDialect,
  parseCron,
  parseCronField,
  stringifyCron,
  stringifyCronField,
} from "./cronUtil.js";

test("parses and stringifies a standard five-part expression", () => {
  const document = parseCron("*/15 8-18 * JAN MON-FRI");
  assert.equal(stringifyCron(document), "*/15 8-18 * 1 1-5");
  assert.deepEqual(document.fields.minute, {
    type: "step",
    base: { type: "any" },
    step: 15,
  });
});

test("preserves composite list structure", () => {
  const field = parseCronField("1,5-10/2,20", "minute");
  assert.equal(field.type, "list");
  assert.equal(stringifyCronField(field), "1,5-10/2,20");
});

test("adds a zero second when converting to six parts", () => {
  const document = convertCronDialect(parseCron("*/5 * * * *"), "seconds-6");
  assert.equal(stringifyCron(document), "0 */5 * * * *");
});

test("rejects invalid ranges and values", () => {
  assert.throws(() => parseCron("61 * * * *"), /outside 0-59/);
  assert.throws(() => parseCron("20-10 * * * *"), /must not exceed/);
});
