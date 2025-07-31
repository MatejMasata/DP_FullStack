import { apiRequest } from "./baseService";

// --- FILE BATCH SERVICE ---

// GET - Get all File Batches (Mastertable)
export const fetchAllFileBatches = (getToken) => {
  return apiRequest(getToken, "/file_batch/", "GET");
};

// POST - Create File Batch
export const createFileBatch = (getToken, fileBatchData) => {
  return apiRequest(getToken, "/file_batch/", "POST", fileBatchData);
};

// GET - Get File Batch by ID
export const fetchFileBatchById = (getToken, id) => {
  return apiRequest(getToken, `/file_batch/${id}`, "GET");
};

// PUT - Update File Batch by ID
export const updateFileBatch = (getToken, id, fileBatchData) => {
  return apiRequest(getToken, `/file_batch/${id}`, "PUT", fileBatchData);
};

// DELETE - Delete File Batch by ID
export const deleteFileBatch = (getToken, id) => {
  return apiRequest(getToken, `/file_batch/${id}`, "DELETE");
};
