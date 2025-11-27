// Worker for off-main-thread Shiki highlighting

let shikiPromise: Promise<typeof import("shiki")> | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { id, instanceId, code, language, themes } = e.data as {
    id: number;
    instanceId?: string;
    code: string;
    language: string;
    themes: { light: string; dark: string };
  };

  try {
    if (!shikiPromise) shikiPromise = import("shiki");
    const shiki = await shikiPromise;
    const html = await shiki.codeToHtml(code, {
      lang: language,
      themes,
    });
    (self as unknown as Worker).postMessage({ id, instanceId, html });
  } catch {
    // Ignore errors and send empty HTML
    (self as unknown as Worker).postMessage({ id, instanceId, html: "" });
  }
};
