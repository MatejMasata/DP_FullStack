import { apiRequest } from "./baseService";

// --- HARVEST SERVICE ---

// GET - Get Harvest by ID
export const fetchHarvestById = (getToken, id) => {
  return apiRequest(getToken, `/harvest/${id}`, "GET");
};

// GET - Get multiple Harvests by an array of IDs
export const fetchHarvestsByIds = async (getToken, ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchHarvestById(getToken, id));
  const results = await Promise.all(promises);
  // Filter out any potential null/undefined results if an ID didn't return a harvest
  return results.filter((harvest) => harvest != null);
};

// POST - Create Harvest
export const createHarvest = (getToken, harvestData) => {
  return apiRequest(getToken, "/harvest/", "POST", harvestData);
};

// PUT - Update Harvest by ID
export const updateHarvest = (getToken, id, harvestData) => {
  return apiRequest(getToken, `/harvest/${id}`, "PUT", harvestData);
};

// DELETE - Delete Harvest by ID
export const deleteHarvest = (getToken, id) => {
  return apiRequest(getToken, `/harvest/${id}`, "DELETE");
};
