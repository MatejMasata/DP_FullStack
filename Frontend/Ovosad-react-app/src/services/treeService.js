import { apiRequest } from "./baseService";

// --- TREE SERVICE ---

// GET - TREE MASTERTABLE
export const fetchTrees = (getToken) => {
  return apiRequest(getToken, "/tree/", "GET");
};

// POST - CREATE TREE
export const createTree = (getToken, treeData) => {
  return apiRequest(getToken, "/tree/", "POST", treeData);
};

// GET - TREE BY ID
export const fetchTreeById = (getToken, id) => {
  return apiRequest(getToken, `/tree/${id}`, "GET");
};

// PUT - UPDATE TREE
export const updateTree = (getToken, id, treeData) => {
  return apiRequest(getToken, `/tree/${id}`, "PUT", treeData);
};

// DELETE - DELETE TREE
export const deleteTree = (getToken, id) => {
  return apiRequest(getToken, `/tree/${id}`, "DELETE");
};
