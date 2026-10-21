export const CRON_DIALECTS = {
  "standard-5": {
    fieldKeys: ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"],
    cronerMode: "5-part",
  },
  "seconds-6": {
    fieldKeys: ["second", "minute", "hour", "dayOfMonth", "month", "dayOfWeek"],
    cronerMode: "6-part",
  },
  "year-7": {
    fieldKeys: ["second", "minute", "hour", "dayOfMonth", "month", "dayOfWeek", "year"],
    cronerMode: "7-part",
  },
};

export const CRON_FIELD_DEFINITIONS = {
  second: { min: 0, max: 59 },
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 },
  year: { min: 1, max: 9999 },
};

const MONTH_ALIASES = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};
const WEEKDAY_ALIASES = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

function error(message, fieldKey) {
  const parseError = new Error(message);
  parseError.fieldKey = fieldKey;
  return parseError;
}

function parseValue(rawValue, fieldKey) {
  const normalized = String(rawValue).trim().toUpperCase();
  const aliases = fieldKey === "month" ? MONTH_ALIASES : fieldKey === "dayOfWeek" ? WEEKDAY_ALIASES : null;
  const value = aliases?.[normalized] ?? Number(normalized);
  const definition = CRON_FIELD_DEFINITIONS[fieldKey];

  if (!Number.isInteger(value) || value < definition.min || value > definition.max) {
    throw error(`Value ${rawValue} is outside ${definition.min}-${definition.max}`, fieldKey);
  }
  return value;
}

function parseAtomicField(source, fieldKey, allowAny = true) {
  const value = source.trim();
  if (allowAny && value === "*") {
    return { type: "any" };
  }
  if (allowAny && value === "?") {
    if (!["dayOfMonth", "dayOfWeek"].includes(fieldKey)) {
      throw error("No-specific-value (?) is only supported for day fields", fieldKey);
    }
    return { type: "noSpecific" };
  }

  if (fieldKey === "dayOfMonth") {
    if (value.toUpperCase() === "L") {
      return { type: "lastDay" };
    }
    if (value.toUpperCase() === "LW") {
      return { type: "lastWeekday" };
    }
    const nearestWeekdayMatch = value.match(/^(\d+)W$/i);
    if (nearestWeekdayMatch) {
      return { type: "nearestWeekday", day: parseValue(nearestWeekdayMatch[1], fieldKey) };
    }
  }

  if (fieldKey === "dayOfWeek") {
    const occurrenceMatch = value.match(/^(.+)#(L|[1-5])$/i);
    if (occurrenceMatch) {
      const weekday = parseValue(occurrenceMatch[1], fieldKey);
      return occurrenceMatch[2].toUpperCase() === "L"
        ? { type: "lastWeekdayOfMonth", weekday }
        : { type: "nthWeekdayOfMonth", weekday, nth: Number(occurrenceMatch[2]) };
    }
    const lastOccurrenceMatch = value.match(/^(.+)L$/i);
    if (lastOccurrenceMatch) {
      return { type: "lastWeekdayOfMonth", weekday: parseValue(lastOccurrenceMatch[1], fieldKey) };
    }
  }

  const stepParts = value.split("/");
  if (stepParts.length === 2) {
    const step = Number(stepParts[1]);
    if (!Number.isInteger(step) || step <= 0) {
      throw error(`Invalid step value: ${stepParts[1]}`, fieldKey);
    }
    const base = parseAtomicField(stepParts[0], fieldKey, true);
    if (!["any", "value", "range"].includes(base.type)) {
      throw error("Step base must be any value, a start value, or a range", fieldKey);
    }
    return { type: "step", base, step };
  }
  if (stepParts.length > 2) {
    throw error(`Invalid step expression: ${value}`, fieldKey);
  }

  const rangeParts = value.split("-");
  if (rangeParts.length === 2) {
    const from = parseValue(rangeParts[0], fieldKey);
    const to = parseValue(rangeParts[1], fieldKey);
    if (from > to) {
      throw error(`Range start ${from} must not exceed ${to}`, fieldKey);
    }
    return { type: "range", from, to };
  }
  if (rangeParts.length > 2 || !value) {
    throw error(`Invalid field expression: ${value}`, fieldKey);
  }

  return { type: "value", value: parseValue(value, fieldKey) };
}

export function parseCronField(source, fieldKey) {
  if (!CRON_FIELD_DEFINITIONS[fieldKey]) {
    throw error(`Unknown cron field: ${fieldKey}`, fieldKey);
  }
  const items = String(source).split(",");
  if (items.length > 1) {
    return {
      type: "list",
      items: items.map((item) => parseAtomicField(item, fieldKey, false)),
    };
  }
  return parseAtomicField(items[0], fieldKey);
}

export function stringifyCronField(field) {
  switch (field?.type) {
    case "any":
      return "*";
    case "noSpecific":
      return "?";
    case "value":
      return String(field.value);
    case "range":
      return `${field.from}-${field.to}`;
    case "step":
      return `${stringifyCronField(field.base)}/${field.step}`;
    case "list":
      return field.items.map(stringifyCronField).join(",");
    case "lastDay":
      return "L";
    case "lastWeekday":
      return "LW";
    case "nearestWeekday":
      return `${field.day}W`;
    case "lastWeekdayOfMonth":
      return `${field.weekday}#L`;
    case "nthWeekdayOfMonth":
      return `${field.weekday}#${field.nth}`;
    default:
      throw new Error(`Unsupported cron field type: ${field?.type}`);
  }
}

export function parseCron(expression, dialect = "standard-5") {
  const config = CRON_DIALECTS[dialect];
  if (!config) {
    throw new Error(`Unsupported cron dialect: ${dialect}`);
  }
  const parts = String(expression).trim().split(/\s+/).filter(Boolean);
  if (parts.length !== config.fieldKeys.length) {
    throw new Error(`Expected ${config.fieldKeys.length} fields, received ${parts.length}`);
  }

  const fields = {};
  config.fieldKeys.forEach((fieldKey, index) => {
    fields[fieldKey] = parseCronField(parts[index], fieldKey);
  });

  return { schemaVersion: 1, dialect, fields };
}

export function stringifyCron(document) {
  const config = CRON_DIALECTS[document?.dialect];
  if (!config) {
    throw new Error(`Unsupported cron dialect: ${document?.dialect}`);
  }
  return config.fieldKeys.map((fieldKey) => stringifyCronField(document.fields[fieldKey])).join(" ");
}

export function createCronDocument(dialect = "standard-5") {
  const expressions = {
    "standard-5": "* * * * *",
    "seconds-6": "0 * * * * *",
    "year-7": "0 * * * * * *",
  };
  const document = parseCron(expressions[dialect], dialect);
  return document;
}

export function convertCronDialect(document, dialect) {
  if (!CRON_DIALECTS[dialect]) {
    throw new Error(`Unsupported cron dialect: ${dialect}`);
  }
  const fields = { ...document.fields };
  if (CRON_DIALECTS[dialect].fieldKeys.includes("second") && !fields.second) {
    fields.second = { type: "value", value: 0 };
  }
  if (CRON_DIALECTS[dialect].fieldKeys.includes("year") && !fields.year) {
    fields.year = { type: "any" };
  }
  return { schemaVersion: 1, dialect, fields };
}
