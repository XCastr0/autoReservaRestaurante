import type { TestInfo } from "@playwright/test";

export async function attachJson(testInfo: TestInfo, name: string, data: unknown) {
  await testInfo.attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: "application/json",
  });
}

export async function attachText(testInfo: TestInfo, name: string, text: string) {
  await testInfo.attach(name, {
    body: text,
    contentType: "text/plain",
  });
}

export function maskPassword<T extends Record<string, any>>(obj: T, field = "senha"): T {
  if (!obj || typeof obj !== "object") return obj;
  if (!(field in obj)) return obj;
  return { ...obj, [field]: "****" };
}
