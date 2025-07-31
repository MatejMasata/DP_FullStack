import { apiRequest } from "./baseService";

// --- TREE IMAGE SERVICE ---

// GET - Get all Tree Images (Mastertable)
export const fetchAllTreeImages = (getToken) => {
  return apiRequest(getToken, "/tree_image/", "GET");
};

// POST - Create Tree Image
export const createTreeImage = (getToken, treeImageData) => {
  return apiRequest(getToken, "/tree_image/", "POST", treeImageData);
};

// GET - Get Tree Image by ID
export const fetchTreeImageById = (getToken, id) => {
  return apiRequest(getToken, `/tree_image/${id}`, "GET");
};

// GET - Get multiple Tree Images by an array of IDs
export const fetchTreeImagesByIds = async (getToken, ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchTreeImageById(getToken, id));
  const results = await Promise.all(promises);
  return results.filter((link) => link != null);
};

// PUT - Update Tree Image by ID
export const updateTreeImage = (getToken, id, treeImageData) => {
  return apiRequest(getToken, `/tree_image/${id}`, "PUT", treeImageData);
};

// DELETE - Delete Tree Image by ID
export const deleteTreeImage = (getToken, id) => {
  return apiRequest(getToken, `/tree_image/${id}`, "DELETE");
};
