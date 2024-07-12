import axios from "./ajax";
export async function loginService(loginData: any): Promise<any> {
  const url = "/login";
  const res = await axios.post(url, loginData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function fetchUserInfoService(): Promise<any> {
  return await axios.get("/getInfo");
}
