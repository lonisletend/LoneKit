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

test("preserves a step expression with a numeric start value", () => {
  const field = parseCronField("0/5", "minute");
  assert.deepEqual(field, {
    type: "step",
    base: { type: "value", value: 0 },
    step: 5,
  });
  assert.equal(stringifyCronField(field), "0/5");
});

test("adds a zero second when converting to six parts", () => {
  const document = convertCronDialect(parseCron("*/5 * * * *"), "seconds-6");
  assert.equal(stringifyCron(document), "0 */5 * * * *");
});

test("parses and converts expressions with a year field", () => {
  const parsed = parseCron("0 30 8 1 * * 2030", "year-7");
  assert.equal(stringifyCron(parsed), "0 30 8 1 * * 2030");
  assert.deepEqual(parsed.fields.year, { type: "value", value: 2030 });

  const converted = convertCronDialect(parseCron("*/5 * * * *"), "year-7");
  assert.equal(stringifyCron(converted), "0 */5 * * * * *");
});

test("parses and stringifies special day expressions", () => {
  assert.deepEqual(parseCronField("?", "dayOfMonth"), { type: "noSpecific" });
  assert.deepEqual(parseCronField("L", "dayOfMonth"), { type: "lastDay" });
  assert.deepEqual(parseCronField("LW", "dayOfMonth"), { type: "lastWeekday" });
  assert.deepEqual(parseCronField("15W", "dayOfMonth"), { type: "nearestWeekday", day: 15 });
  assert.deepEqual(parseCronField("FRI#2", "dayOfWeek"), {
    type: "nthWeekdayOfMonth",
    weekday: 5,
    nth: 2,
  });
  assert.deepEqual(parseCronField("5#L", "dayOfWeek"), {
    type: "lastWeekdayOfMonth",
    weekday: 5,
  });

  const document = parseCron("0 0 9 15W * ? *", "year-7");
  assert.equal(stringifyCron(document), "0 0 9 15W * ? *");
});

test("rejects special day expressions in unsupported fields", () => {
  assert.throws(() => parseCronField("?", "minute"), /only supported for day fields/);
  assert.throws(() => parseCronField("15W", "month"), /outside 1-12/);
});

test("rejects invalid ranges and values", () => {
  assert.throws(() => parseCron("61 * * * *"), /outside 0-59/);
  assert.throws(() => parseCron("20-10 * * * *"), /must not exceed/);
});
