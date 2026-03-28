/** Lê corpo da Response como JSON ou objeto vazio / fallback não-JSON. */
export async function readResponseJsonUnknown(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}
