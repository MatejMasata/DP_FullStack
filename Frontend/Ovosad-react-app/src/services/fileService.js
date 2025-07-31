import { apiRequest } from "./baseService";

// --- FILE SERVICE ---

// GET - Get all Files (Mastertable)
export const fetchAllFiles = (getToken) => {
  return apiRequest(getToken, "/file/", "GET");
};

// // POST - Create File - wrong sends json
// export const createFile = (getToken, fileData) => {
//   return apiRequest(getToken, "/file/", "POST", fileData);
// };

// GET - Get File by ID
export const fetchFileById = (getToken, id) => {
  return apiRequest(getToken, `/file/${id}`, "GET");
};

// GET - Get multiple Files by an array of IDs
export const fetchFilesByIds = async (getToken, ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchFileById(getToken, id));
  const results = await Promise.all(promises);
  return results.filter((file) => file != null);
};

// // GET - Get File Content by ID
// // - returns Image and not JSON - not correct
// export const fetchFileContentById = (getToken, id) => {
//   return apiRequest(getToken, `/file/${id}/content`, "GET");
// };

// GET - Get File as a blob by ID
export const fetchImageBlob = async (getToken, id) => {
  const token = await getToken();
  const response = await fetch(`/api/v1/file/${id}/content`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image content: ${response.statusText}`);
  }

  return response.blob();
};

// POST - File upload to specific Batch
// - Handles multipart/form-data and sends required data as query parameters
export const uploadFile = async (getToken, file, batchId) => {
  const token = await getToken();
  const formData = new FormData();

  // The API expects the file under the key 'upload_file'
  formData.append("upload_file", file);

  // Construct the URL
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const Datetime = `${year}${month}${day}_${hours}${minutes}${seconds}`;

  const url = `/api/v1/file/?file_batch_id=${batchId}&file_datetime=${Datetime}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type' - browser handles it for multipart/form-data.
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to upload file: ${response.statusText}`
    );
  }

  return response.json();
};
