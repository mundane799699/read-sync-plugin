/**
 * 存储/获取 user token
 */

const KEY = "Admin-Token";

export async function setToken(token: string) {
  await browser.storage.local.set({ [KEY]: token });
}

export async function getToken() {
  const token = await browser.cookies.get({
    url: "http://localhost:8081",
    name: KEY,
  });
  const { value } = token;
  console.log("token = ", value);
  return value;
}

export function removeToken() {
  browser.storage.local.remove(KEY);
}
