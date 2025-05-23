import { api } from "../app/api";
import { store } from "../app/store"; // путь до твоего Redux store

export const checkBackendAlive = async () => {
  try {
    const result = await store
      .dispatch(api.endpoints.checkBackend.initiate())
      .unwrap();
    return result.status === "ok";
  } catch {
    return false;
  }
};
