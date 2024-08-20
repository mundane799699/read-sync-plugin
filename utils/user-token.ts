/**
 * 存储/获取 user token
 */

const KEY = "Admin-Token";

export async function setToken(token: string) {
  await browser.storage.local.set({ [KEY]: token });
}

export async function getToken() {
  const token = await browser.cookies.get({
    // url: "https://readecho.cn",
    url: import.meta.env.VITE_BASE_WEB,
    name: KEY,
  });
  if (!token) {
    return "";
  }
  const { value } = token;
  return value;
}

export function removeToken() {
  browser.storage.local.remove(KEY);
}
