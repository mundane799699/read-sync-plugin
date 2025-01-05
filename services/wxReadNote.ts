import axios from "./ajax";

export async function syncWxReadNotesService(params: any): Promise<any> {
  const url = "/wxread/notes/sync";
  const res = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function getRandomReview(): Promise<any> {
  return await axios.get("/wxread/notes/getRandomReview");
}
