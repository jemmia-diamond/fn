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
      const token = btoa(`${apiKey}:${apiSecret}`);
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

  // CRUD

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
    const documents = await this.getList(doc.doctype, { filters: [[key, "=", doc[key]]] });
    if (documents.length > 1) {
      throw new Error(`Multiple ${doc.doctype} found for ${key} ${doc[key]}`);
    } else if (documents.length === 1) {
      if (documents[0].docstatus === 2) {
        return documents[0];
      };
      doc.name = documents[0].name;
      // Remove ignored fields before update
      for (const field of ignoredFields) {
        delete doc[field];
      }
      return this.update(doc);
    } else {
      return this.insert(doc);
    }
  }

  async bulkUpdate(docs) {
    const docsWithDocNames = docs.map(doc => ({ ...doc, docname: doc.name }));
    return this.postRequest("", {
      cmd: "frappe.client.bulk_update",
      docs: JSON.stringify(docsWithDocNames)
    });
  }

  async reference(doc, doctype, referencedDoc, referencedDoctype) {
    const docWithLinks = await this.getDoc(doctype, doc.name);
    if (!docWithLinks.links) {
      docWithLinks.links = [];
    }
    docWithLinks.links.push({ "link_doctype": referencedDoctype, "link_name": referencedDoc.name });
    docWithLinks.doctype = doctype;
    return this.update(docWithLinks);
  }

  // --- Utility methods ---

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
    } catch (e) {
      console.error("Invalid JSON:", e);
      return null;
    }
    const traceback = arr[0] ?? "";
    const lines = traceback.split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes(":")) {
        const parts = line.split(":");
        if (parts[0].toLowerCase().includes("error") || parts[0].toLowerCase().includes("exception")) {
          return parts.slice(1).join(":").trim();
        }
      }
    }
    return null;
  }

  async postProcess(res) {
    // If response is object, use it directly
    if (typeof res.data === "object" && res.data !== null) {
      if (res.data.exc) throw new Error(res.data.exc);
      return res.data.message ?? res.data.data ?? null;
    }
    // If response is string, try parse
    try {
      const data = JSON.parse(res.data);
      if (data.exc) throw new Error(data.exc);
      return data.message ?? data.data ?? null;
    } catch (e) {
      throw this.parseErrorMessage(e);
    }  
  }
}
