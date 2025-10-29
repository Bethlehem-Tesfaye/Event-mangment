import redis from "../config/redis";
import { fetchWithCache } from "../utils/fetchWithCache";
import { escapeRediSearch, parseRediSearchResults } from "../utils/redisSearch";

export default class BaseSearch {
  /**
   * @param {Object} options
   * @param {String} options.resource
   * @param {Array} options.schemaFields
   * @param {Function} options.fetchFn
   * @param {Function} options.transformInFn
   * @param {Function} options.transformOutFn
   */
  constructor({
    resource,
    schemaFields = [],
    fetchFn,
    transformInFn = null,
    transformOutFn = null
  }) {
    if (!resource || typeof fetchFn !== "function") {
      throw new Error("resource and fetchFn are required");
    }
    this.resource = resource.toLowerCase();
    this.schemaFields = Array.isArray(schemaFields) ? schemaFields : [];
    this.fetchFn = fetchFn;

    this.transformInFn =
      typeof transformInFn === "function" ? transformInFn : null;

    this.transformOutFn =
      typeof transformOutFn === "function" ? transformOutFn : null;
  }

  getFieldType(fieldName) {
    const f = this.schemaFields.find((ff) => ff.name === fieldName);
    return f?.type?.toUpperCase() || "TEXT";
  }

  toNumeric(value, fieldType) {
    if (fieldType === "NUMERIC") {
      if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
      ) {
        const parsed = Date.parse(value.trim());
        return isNaN(parsed) ? null : parsed;
      }
      return Number(value);
    }
    if (value == null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string") {
      const trimmed = value.trim();
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed)) return parsed;
      const num = Number(trimmed);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  async fetchAllCached() {
    return (
      (await fetchWithCache({
        baseKey: this.resource.toUpperCase(),
        fetchFn: this.fetchFn,
        transformInFn: this.transformInFn,
        searchIndexConfig: {
          indexName: `idx:${this.resource}`,
          keyPrefix: `${this.resource}:search:`
        }
      })) || []
    );
  }

  buildRedisQuery(normalizedMatch) {
    const parts = [];
    for (const m of normalizedMatch) {
      if (!m) continue;

      if (m.type === "range") {
        const s = m.startValue;
        const e = m.endValue;
        if (
          s == null ||
          e == null ||
          String(s).trim() === "" ||
          String(e).trim() === ""
        )
          continue;
        const fieldType = this.getFieldType(m.field);
        const start = this.toNumeric(s, fieldType);
        const end = this.toNumeric(e, fieldType);
        if (start == null || end == null) continue;
        parts.push(`@${m.field}:[${start} ${end}]`);
        continue;
      }

      if (m.type === "exists") {
        if (m.value === true) {
          const fieldType = this.getFieldType(m.field);
          if (fieldType === "TAG") {
            parts.push(`@${m.field}:{*}`);
          } else {
            parts.push(`@${m.field}:*`);
          }
        } else if (m.value === false) {
          const fieldType = this.getFieldType(m.field);
          if (fieldType === "TAG") {
            parts.push(`(-@${m.field}:{*})`);
          } else {
            parts.push(`(* -@${m.field}:*)`);
          }
        }
        continue;
      }

      if (m.value == null || String(m.value).trim() === "") continue;
      let rawValue = m.value;
      const fieldType = this.getFieldType(m.field);

      if (
        fieldType === "TAG" &&
        typeof rawValue === "string" &&
        rawValue.includes(",")
      ) {
        const values = rawValue
          .split(",")
          .map((v) => escapeRediSearch(v.trim()))
          .filter(Boolean);
        if (values.length) {
          parts.push(`@${m.field}:{${values.join("|")}}`);
          continue;
        }
      }

      if (fieldType === "TAG") {
        parts.push(
          `@${m.field}:{${escapeRediSearch(String(rawValue).trim())}}`
        );
        continue;
      }

      if (
        typeof rawValue === "boolean" ||
        rawValue === "true" ||
        rawValue === "false"
      ) {
        parts.push(`@${m.field}:{${String(rawValue).toLowerCase()}}`);
      } else if (
        !isNaN(Number(rawValue)) &&
        (fieldType === "NUMERIC" || m.type === "numeric")
      ) {
        parts.push(`@${m.field}:[${Number(rawValue)} ${Number(rawValue)}]`);
      } else {
        const escaped = escapeRediSearch(String(rawValue).trim());
        const val = m.type === "partial" ? `*${escaped}*` : escaped;
        parts.push(`@${m.field}:${val}`);
      }
    }
    return parts.join(" & ");
  }

  normalizeMatch(match) {
    return (Array.isArray(match) ? match : [])
      .map((m) => {
        if (!m || typeof m !== "object") return null;
        const keys = Object.keys(m);

        if (
          keys.length === 1 &&
          typeof m[keys[0]] === "object" &&
          m[keys[0]] !== null &&
          "exists" in m[keys[0]]
        ) {
          const field = keys[0];
          const existsValue = m[field].exists;
          if (
            existsValue === undefined ||
            existsValue === null ||
            (typeof existsValue === "string" && existsValue.trim() === "")
          )
            return null;
          const sval =
            typeof existsValue === "string"
              ? existsValue.trim().toLowerCase()
              : existsValue;
          const existsBool =
            sval === true ||
            sval === "true" ||
            sval === "1" ||
            sval === 1 ||
            sval === "yes";

          return {
            type: "exists",
            field,
            value: existsBool
          };
        }

        if (
          keys.length === 1 &&
          typeof m[keys[0]] === "object" &&
          m[keys[0]] !== null &&
          "from" in m[keys[0]] &&
          "to" in m[keys[0]]
        ) {
          const field = keys[0];
          const { from, to } = m[field];
          const hasFrom = !(
            from === undefined ||
            from === null ||
            (typeof from === "string" && from.trim() === "")
          );
          const hasTo = !(
            to === undefined ||
            to === null ||
            (typeof to === "string" && to.trim() === "")
          );
          if (!hasFrom && !hasTo) return null;
          return {
            type: "range",
            field,
            startValue: hasFrom ? from : null,
            endValue: hasTo ? to : null
          };
        }

        if (m.field !== undefined || m.value !== undefined)
          return { field: m.field, value: m.value, type: m.type || "full" };
        const field = keys[0];
        return { field, value: m[field], type: m.type || "full" };
      })
      .filter((entry) => {
        if (!entry) return false;
        if (entry.type === "exists" || entry.type === "range") return true;
        if (entry.value === undefined || entry.value === null) return false;
        if (typeof entry.value === "string" && entry.value.trim() === "")
          return false;
        return true;
      });
  }
  parseAggregateKeys(rawAggResult) {
    if (!Array.isArray(rawAggResult) || rawAggResult.length <= 1) return [];
    const keys = [];
    for (let i = 1; i < rawAggResult.length; i++) {
      const row = rawAggResult[i];
      if (!Array.isArray(row)) continue;
      for (let j = 0; j < row.length; j += 2) {
        const k = row[j];
        const v = row[j + 1];
        if (k === "__key" || k === "@__key") {
          keys.push(v);
          break;
        }
      }
    }
    return keys;
  }

  async fetchJsonForKeys(client, keys) {
    const docs = await Promise.all(
      keys.map(async (k) => {
        try {
          const resp = await client.sendCommand(["JSON.GET", k, "$"]);
          if (!resp) return null;
          try {
            const parsed = JSON.parse(resp);
            return Array.isArray(parsed) ? parsed[0] : parsed;
          } catch (e) {
            return null;
          }
        } catch (e) {
          return null;
        }
      })
    );
    return docs.filter(Boolean);
  }

  async runAggregateForExists(normalizedExists, page = 1, limit = 100) {
    const client = await redis.getClient();
    const fields = Array.from(
      new Set(
        (Array.isArray(normalizedExists) ? normalizedExists : [])
          .filter((m) => m && m.type === "exists" && m.field)
          .map((m) => m.field)
      )
    );

    if (fields.length === 0) return [];
    const filterParts = fields.map((f) => {
      const m = normalizedExists.find(
        (x) => x.field === f && x.type === "exists"
      );
      const expr = m && m.value === true ? `@${f} != ""` : `@${f} == ""`;
      return `(${expr})`;
    });

    const filterExpr = filterParts.join(" && ");
    const start = (Number(page) - 1) * Number(limit);
    const loadCount = 1 + fields.length;
    const loadArgs = [
      "LOAD",
      String(loadCount),
      "@__key",
      ...fields.map((f) => `@${f}`)
    ];
    const aggArgs = [
      "FT.AGGREGATE",
      `idx:${this.resource}`,
      "*",
      ...loadArgs,
      "FILTER",
      filterExpr,
      "LIMIT",
      String(start),
      String(limit)
    ];

    let raw;
    try {
      raw = await client.sendCommand(aggArgs);
    } catch (err) {
      console.error(
        `[${this.resource}] FT.AGGREGATE failed:`,
        err.message || err
      );
      return [];
    }

    const keys = this.parseAggregateKeys(raw);
    if (!keys.length) return [];

    const docs = await this.fetchJsonForKeys(client, keys);
    return docs;
  }
  async runRedisSearch(redisQuery, page = 1, limit = 100, sort = null) {
    const client = await redis.getClient();
    let resultData = [];
    try {
      let sortArgs = [];
      if (sort && typeof sort === "object") {
        const sortField = Object.keys(sort)[0];
        const sortDir = (sort[sortField] || "ASC").toUpperCase();
        sortArgs = ["SORTBY", sortField, sortDir === "DESC" ? "DESC" : "ASC"];
      }

      const redisArgs = [
        "FT.SEARCH",
        `idx:${this.resource}`,
        redisQuery || "*",
        "RETURN",
        "1",
        "$",
        ...sortArgs,
        "LIMIT",
        `${(page - 1) * limit}`,
        `${limit}`
      ];
      const rawResults = await client.sendCommand(redisArgs);
      const parsed = parseRediSearchResults(rawResults);
      if (parsed.length) resultData = parsed;
    } catch (err) {
      console.error(
        `[${this.resource}] RedisSearch failed:`,
        err.message || err
      );
    }
    return resultData;
  }

  applyTransformOut(items) {
    if (typeof this.transformOutFn === "function") {
      try {
        return this.transformOutFn(items) || items;
      } catch (e) {
        console.error("transformOutFn failed", e);
        return items;
      }
    }
    return items;
  }

  jsFilter(allData, normalizedMatch) {
    console.log("ff");

    return allData.filter((item) =>
      normalizedMatch.every((matchEntry) => {
        if (matchEntry.type === "range") {
          const itemVal = item?.[matchEntry.field];
          if (itemVal == null) return false;
          const fieldType = this.getFieldType(matchEntry.field);
          const itemNum = this.toNumeric(itemVal, fieldType);
          const s = this.toNumeric(matchEntry.startValue, fieldType);
          const e = this.toNumeric(matchEntry.endValue, fieldType);
          if (itemNum == null || s == null || e == null) return false;
          return itemNum >= s && itemNum <= e;
        }

        if (matchEntry.type === "exists") {
          const itemVal = item?.[matchEntry.field];
          const isEmpty =
            itemVal == null ||
            (typeof itemVal === "string" && itemVal.trim() === "");
          return matchEntry.value ? !isEmpty : isEmpty;
        }

        const { value, field } = matchEntry;
        const itemVal = item?.[field];
        if (itemVal == null) return false;
        if (typeof itemVal === "string")
          return itemVal.toLowerCase().includes(String(value).toLowerCase());
        return itemVal === value;
      })
    );
  }

  async query({ match = [], page = 1, limit = 100, sort = null } = {}) {
    const normalized = this.normalizeMatch(match);
    const hasSearch = normalized.some((m) => {
      if (!m) return false;
      if (m.type === "range")
        return (
          (m.startValue != null && String(m.startValue).trim() !== "") ||
          (m.endValue != null && String(m.endValue).trim() !== "")
        );
      if (m.type === "exists")
        return m.field && (m.value === true || m.value === false);
      return m.value != null && String(m.value).trim() !== "";
    });

    const allData = await this.fetchAllCached();

    if (!hasSearch) {
      let sortedData = allData;
      if (sort && typeof sort === "object") {
        const sortField = Object.keys(sort)[0];
        const sortDir = (sort[sortField] || "ASC").toUpperCase();
        sortedData = sortedData.sort((a, b) => {
          if (sortDir === "DESC") {
            if (a[sortField] < b[sortField]) return 1;
            if (a[sortField] > b[sortField]) return -1;
            return 0;
          } else {
            if (a[sortField] < b[sortField]) return -1;
            if (a[sortField] > b[sortField]) return 1;
            return 0;
          }
        });
      }
      const result = sortedData.slice((page - 1) * limit, page * limit);
      return this.applyTransformOut(result);
    }

    // If the query consists ONLY of exists checks, use FT.AGGREGATE (pure RediSearch)
    const allAreExists =
      normalized.length > 0 &&
      normalized.every((m) => m && m.type === "exists");

    if (allAreExists) {
      const aggResults = await this.runAggregateForExists(
        normalized,
        page,
        limit
      );
      return this.applyTransformOut(aggResults);
    }

    const redisQuery = this.buildRedisQuery(normalized);
    console.log("Redis query:", redisQuery);
    const redisResults = await this.runRedisSearch(
      redisQuery,
      page,
      limit,
      sort
    );
    if (redisResults.length === 0) return [];

    // For non-exists queries, post-filter in JS to apply all match conditions
    const filteredResults = this.jsFilter(redisResults, normalized);
    return this.applyTransformOut(filteredResults);
  }
}
