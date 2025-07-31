import { apiRequest } from "./baseService";

// --- ORCHARD SERVICE ---

// GET - ORCHARD MASTERTABLE
export const fetchOrchards = (getToken) => {
  return apiRequest(getToken, "/orchard/", "GET");
};

// GET - ORCHARD BY ID
export const fetchOrchardById = (getToken, id) => {
  return apiRequest(getToken, `/orchard/${id}`, "GET");
};

// POST - CREATE ORCHARD
export const createOrchard = (getToken, orchardData) => {
  return apiRequest(getToken, "/orchard/", "POST", orchardData);
};

// PUT - UPDATE ORCHARD
export const updateOrchard = (getToken, id, orchardData) => {
  return apiRequest(getToken, `/orchard/${id}`, "PUT", orchardData);
};

// DELETE - DELETE ORCHARD
export const deleteOrchard = (getToken, id) => {
  return apiRequest(getToken, `/orchard/${id}`, "DELETE");
};
