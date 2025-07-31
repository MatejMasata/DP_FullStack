import { apiRequest } from "./baseService";

// --- SPRAYING SERVICE ---

// GET - Get all Sprayings (Mastertable)
export const fetchAllSprayings = (getToken) => {
  return apiRequest(getToken, "/spraying/", "GET");
};

// GET - Get Sprayings by list of IDs
export const fetchSprayingsByIds = async (getToken, ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchSprayingById(getToken, id));
  return Promise.all(promises);
};

// POST - Create Spraying
export const createSpraying = (getToken, sprayingData) => {
  return apiRequest(getToken, "/spraying/", "POST", sprayingData);
};

// GET - Get Spraying by ID
export const fetchSprayingById = (getToken, id) => {
  return apiRequest(getToken, `/spraying/${id}`, "GET");
};

// PUT - Update Spraying by ID
export const updateSpraying = (getToken, id, sprayingData) => {
  return apiRequest(getToken, `/spraying/${id}`, "PUT", sprayingData);
};

// DELETE - Delete Spraying by ID
export const deleteSpraying = (getToken, id) => {
  return apiRequest(getToken, `/spraying/${id}`, "DELETE");
};
