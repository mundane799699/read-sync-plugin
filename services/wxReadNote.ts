import axios from "./ajax";

export async function syncWxReadNotesService(params: any): Promise<any> {
  const url = "/wxread/notes/sync";
  const res = await axios.post(url, params);
  return res;
}

export async function getRandomReview(): Promise<any> {
  return await axios.get("/wxread/notes/getRandomReview");
}

export async function getNotesCount(): Promise<any> {
  return await axios.get("/wxread/notes/getNotesCount");
}
