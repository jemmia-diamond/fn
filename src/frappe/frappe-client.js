// FrappeClient.js
const DEFAULT_HEADERS = { Accept: "application/json" };

export default class FrappeClient {
  constructor({ url, username, password, apiKey, apiSecret, verify = true }) {
    this.url = url;
    this.verify = verify;
    this.headers = { ...DEFAULT_HEADERS };
    this.canDownload = [];

    if (apiKey && apiSecret) {
      const token = btoa(`${apiKey}:${apiSecret}`);
      this.headers["Authorization"] = `Basic ${token}`;
    }

    if (username && password) {
      this.login(username, password);
    }
  }

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

  async getList(doctype, {
    fields = ["*"],
    filters = null,
    limit_start = 0,
    limit_page_length = 0,
    order_by = null
  } = {}) {
    const params = {
      fields: JSON.stringify(fields),
      ...(filters && { filters: JSON.stringify(filters) }),
      ...(limit_page_length && { limit_start, limit_page_length }),
      ...(order_by && { order_by })
    };

    const url = `${this.url}/api/resource/${encodeURIComponent(doctype)}`;
    const res = await fetch(`${url}?${new URLSearchParams(params)}`, {
      method: "GET",
      headers: this.headers
    });
    return this.postProcess(res);
  }

  async getDoc(doctype, name) {
    const url = `${this.url}/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers
    });
    return this.postProcess(res);
  }

  async insert(doc) {
    const res = await fetch(`${this.url}/api/resource/${encodeURIComponent(doc.doctype)}`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ data: JSON.stringify(doc) })
    });
    return this.postProcess(res);
  }

  async insertMany(docs) {
    return this.postRequest("", {
      cmd: "frappe.client.insert_many",
      docs: JSON.stringify(docs)
    });
  }

  async update(doc) {
    const url = `${this.url}/api/resource/${encodeURIComponent(doc.doctype)}/${encodeURIComponent(doc.name)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ data: JSON.stringify(doc) })
    });
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
    const docWithLinks = this.getDoc(doctype, doc.name);
    if (!docWithLinks.links) {
      docWithLinks.links = [];
    }
    docWithLinks.links.push({ "link_doctype": referencedDoctype, "link_name": referencedDoc.name });
    docWithLinks.doctype = doctype;
    return this.update(docWithLinks);
  }

  // --- Utility methods ---

  async postRequest(path = "", data = {}) {
    const res = await fetch(`${this.url}${path}`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data)
    });
    return this.postProcess(res);
  }

  async getRequest(path = "", params = {}) {
    const url = `${this.url}${path}?${new URLSearchParams(params)}`;
    const res = await fetch(url, { headers: this.headers });
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
      // Try to extract message from Error object or fallback to string conversion
      if (errorStr && typeof errorStr.message === "string") {
        errorStr = errorStr.message;
      } else {
        errorStr = String(errorStr);
      }
    }
    // Remove the prefix
    const jsonPart = errorStr.replace(/^Error:\s*/, "").trim();
    // Parse the ["..."] JSON
    let arr;
    try {
      arr = JSON.parse(jsonPart);
    } catch (e) {
      console.error("Invalid JSON:", e);
      return null;
    }
    const traceback = arr[0];
    // Split by newlines
    const lines = traceback.split("\n");
    // Reverse and find last line with Error or Exception
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
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data.exc) throw new Error(data.exc);
      return data.message || data.data || null;
    } catch (e) {
      throw this.parseErrorMessage(e);
    }
  }
}
