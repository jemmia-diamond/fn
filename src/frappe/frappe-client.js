// FrappeClient.js
import axios from "axios";
import axiosRetry from "axios-retry";
import { createFetchAdapter } from "@haverstack/axios-fetch-adapter";
const fetchAdapter = createFetchAdapter(); 

const DEFAULT_HEADERS = { Accept: "application/json" };

export default class FrappeClient {
  constructor({ url, username, password, apiKey, apiSecret, verify = true }) {
    this.url = url;
    this.verify = verify;
    this.headers = { ...DEFAULT_HEADERS };
    this.canDownload = [];

    if (apiKey && apiSecret) {
      const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      this.headers.Authorization = `Basic ${token}`;
    }

    this.axios = axios.create({
      baseURL: url,
      timeout: 30_000,
      headers: { ...this.headers },
      adapter: fetchAdapter
    });

    // Retry 3 times
    axiosRetry(this.axios, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (err) =>
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        err.response?.status >= 500
    });

    if (username && password) {
      this.login(username, password);
    }
  }

  // Auth

  async login(username, password) {
    const res = await this.postRequest("", {
      cmd: "login",
      usr: username,
      pwd: password
    });
    if (res !== "Logged In") throw new Error("Authentication failed");
  }

  async logout() {
    await this.getRequest("", { cmd: "logout" });
  }

  //CRUD

  async getList(
    doctype,
    {
      fields = ["*"],
      filters = null,
      limit_start = 0,
      limit_page_length = 0,
      order_by = null
    } = {}
  ) {
    const params = {
      fields: JSON.stringify(fields),
      ...(filters && { filters: JSON.stringify(filters) }),
      ...(limit_page_length && { limit_start, limit_page_length }),
      ...(order_by && { order_by })
    };

    const url = `/api/resource/${encodeURIComponent(doctype)}`;
    const res = await this.axios.get(url, { params });
    return this.postProcess(res);
  }

  async getDoc(doctype, name) {
    const url = `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`;
    const res = await this.axios.get(url);
    return this.postProcess(res);
  }

  async insert(doc) {
    const url = `/api/resource/${encodeURIComponent(doc.doctype)}`;
    const res = await this.axios.post(
      url,
      { data: JSON.stringify(doc) },
      { headers: { "Content-Type": "application/json" } }
    );
    return this.postProcess(res);
  }

  async insertMany(docs) {
    return this.postRequest("", {
      cmd: "frappe.client.insert_many",
      docs: JSON.stringify(docs)
    });
  }

  async update(doc) {
    const url = `/api/resource/${encodeURIComponent(doc.doctype)}/${encodeURIComponent(doc.name)}`;
    const res = await this.axios.put(
      url,
      { data: JSON.stringify(doc) },
      { headers: { "Content-Type": "application/json" } }
    );
    return this.postProcess(res);
  }

  async upsert(doc, key, ignoredFields = []) {
    const records = await this.getList(doc.doctype, {
      filters: [[key, "=", doc[key]]]
    });

    if (records.length > 1) {
      throw new Error(`Multiple ${doc.doctype} found for ${key} ${doc[key]}`);
    } else if (records.length === 1) {
      if (records[0].docstatus === 2) return records[0];

      doc.name = records[0].name;
      ignoredFields.forEach((f) => delete doc[f]);
      return this.update(doc);
    }
    return this.insert(doc);
  }

  async bulkUpdate(docs) {
    const docsWithNames = docs.map((d) => ({ ...d, docname: d.name }));
    return this.postRequest("", {
      cmd: "frappe.client.bulk_update",
      docs: JSON.stringify(docsWithNames)
    });
  }

  async reference(doc, doctype, referencedDoc, referencedDoctype) {
    const fullDoc = await this.getDoc(doctype, doc.name);
    fullDoc.links = fullDoc.links || [];
    fullDoc.links.push({
      link_doctype: referencedDoctype,
      link_name: referencedDoc.name
    });
    fullDoc.doctype = doctype;
    return this.update(fullDoc);
  }

  // Helper wrappers

  async postRequest(path = "", data = {}) {
    const res = await this.axios.post(
      path,
      new URLSearchParams(data),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return this.postProcess(res);
  }

  async getRequest(path = "", params = {}) {
    const res = await this.axios.get(path, { params });
    return this.postProcess(res);
  }

  // Utils

  chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  parseErrorMessage(errorStr) {
    if (typeof errorStr !== "string") {
      errorStr = errorStr?.message ?? String(errorStr);
    }
    const jsonPart = errorStr.replace(/^Error:\s*/, "").trim();
    let arr;
    try {
      arr = JSON.parse(jsonPart);
    } catch {
      return null;
    }
    const traceback = arr[0] ?? "";
    const lines = traceback.split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes(":")) {
        const [kind, ...rest] = line.split(":");
        if (kind.toLowerCase().includes("error") || kind.toLowerCase().includes("exception")) {
          return rest.join(":").trim();
        }
      }
    }
    return null;
  }

  async postProcess(res) {
    const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    let data;
    try {
      data = typeof res.data === "string" ? JSON.parse(raw) : res.data;
      if (data.exc) throw new Error(data.exc);
      return data.message ?? data.data ?? null;
    } catch (e) {
      throw this.parseErrorMessage(e);
    }
  }
}
