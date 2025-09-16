// Worker for off-main-thread Shiki highlighting

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let shikiPromise: Promise<any> | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { id, instanceId, code, language, themes } = e.data as {
    id: number;
    instanceId?: string;
    code: string;
    language: string;
    themes: { light: string; dark: string };
  };

  try {
    if (!shikiPromise) shikiPromise = import('shiki');
    const { codeToHtml } = await shikiPromise;
    const html = await codeToHtml(code, {
      lang: language as any,
      themes,
    });
    (self as unknown as Worker)['postMessage']({ id, instanceId, html });
  } catch (err) {
    (self as unknown as Worker)['postMessage']({ id, instanceId, html: '' });
  }
};


