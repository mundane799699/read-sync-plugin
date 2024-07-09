/**
 * 存储/获取 user token
 */

const KEY = "USER_TOKEN";

export async function setToken(token: string) {
  await browser.storage.local.set({ [KEY]: token });
}

export async function getToken() {
  const result = await browser.storage.local.get(KEY);
  console.log("result = ", result);
  return result[KEY] || null;
}

export function removeToken() {
  browser.storage.local.remove(KEY);
}
