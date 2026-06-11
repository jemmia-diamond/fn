export async function downloadToFile(url: string, fallbackName: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.status}`);
  }
  const blob = await response.blob();
  const urlPath = new URL(url).pathname;
  const name = urlPath.split("/").filter(Boolean).pop() || fallbackName;
  return new File([blob], name, { type: blob.type || "application/octet-stream" });
}
