import { apiRequest } from "./baseService";

// --- TREE DATA SERVICE ---

// GET - Get Tree Data entry by ID
export const fetchTreeDataEntryById = (getToken, id) => {
  return apiRequest(getToken, `/tree_data/${id}`, "GET");
};

// GET - Get multiple Tree Data entries by an array of IDs
export const fetchTreeDataEntriesByIds = async (getToken, ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchTreeDataEntryById(getToken, id));
  const results = await Promise.all(promises);
  return results.filter((entry) => entry != null);
};

// POST - Create Tree Data entry
export const createTreeDataEntry = (getToken, treeDataEntryData) => {
  return apiRequest(getToken, "/tree_data/", "POST", treeDataEntryData);
};

// PUT - Update Tree Data entry by ID
export const updateTreeDataEntry = (getToken, id, treeDataEntryData) => {
  return apiRequest(getToken, `/tree_data/${id}`, "PUT", treeDataEntryData);
};

// DELETE - Delete Tree Data entry by ID
export const deleteTreeDataEntry = (getToken, id) => {
  return apiRequest(getToken, `/tree_data/${id}`, "DELETE");
};
