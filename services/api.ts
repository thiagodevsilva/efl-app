import axios from "axios";

import { API_BASE_URL } from "../constants/config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});
