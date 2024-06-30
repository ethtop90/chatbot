// frontend/src/util/APIService.tx
import axios from "axios";
import { baseUrl } from "./endpoints";

export const APIService = axios.create({
  baseURL: baseUrl,
});

export const altAPIService = (method: string, address: string, payload: object) => {
  return axios({
    method: method,
    url: `${baseUrl}/${address}`,
    data: payload,
  });
};
