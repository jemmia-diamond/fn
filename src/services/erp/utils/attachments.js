/**
 * Fetch attachments for a Frappe document and normalize their URLs
 * @param {FrappeClient} frappeClient - The frappe client instance
 * @param {object} env - The environment variables
 * @param {string} doctype - The doctype to fetch attachments for
 * @param {string} docname - The docname to fetch attachments for
 * @returns {Promise<Array>} A promise that resolves to an array of normalized attachments
 */
export const getDocAttachments = async (frappeClient, env, doctype, docname) => {
  const files = await frappeClient.getList("File", {
    filters: [
      ["attached_to_doctype", "=", doctype],
      ["attached_to_name", "=", docname]
    ],
    fields: ["file_name", "file_url", "is_private"]
  });

  const normalizeUrl = (url) => {
    if (!url) return url;

    let decodedUrl = url;
    try {
      decodedUrl = decodeURIComponent(url);
    } catch {
      // ignore
    }

    let absoluteUrl = decodedUrl;
    if (!absoluteUrl.startsWith("http")) {
      const base = (env.JEMMIA_ERP_BASE_URL || "").replace(/\/$/, "");
      const path = absoluteUrl.startsWith("/") ? absoluteUrl : `/${absoluteUrl}`;
      absoluteUrl = `${base}${path}`;
    }

    return encodeURI(absoluteUrl);
  };

  return (files || []).map(file => ({
    file_name: file.file_name,
    file_url: normalizeUrl(file.file_url),
    is_private: file.is_private
  }));
};
