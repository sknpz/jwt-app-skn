import axios from "axios";

// Cliente usado só no servidor do Next (server action e route handlers),
// que é quem fala direto com a API. O navegador usa o de lib/http.ts.
export const API_URL = process.env.API_URL || "http://localhost:3001/v1";

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export default publicApi;
