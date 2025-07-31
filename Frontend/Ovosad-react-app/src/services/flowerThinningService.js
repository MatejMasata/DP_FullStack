import { apiRequest } from "./baseService";

// --- FLOWER THINNING SERVICE ---

// GET - Get Flower Thinning by ID
export const fetchFlowerThinningById = (getToken, id) => {
  return apiRequest(getToken, `/flower-thinning/${id}`, "GET");
};

// GET - Get Flower Thinnings by list of IDs
export const fetchFlowerThinningsByIds = async (getToken, ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchFlowerThinningById(getToken, id));
  return Promise.all(promises);
};

// PUT - Update Flower Thinning by ID
export const updateFlowerThinning = (getToken, id, flowerThinningData) => {
  return apiRequest(
    getToken,
    `/flower-thinning/${id}`,
    "PUT",
    flowerThinningData
  );
};

// DELETE - Delete Flower Thinning by ID
export const deleteFlowerThinning = (getToken, id) => {
  return apiRequest(getToken, `/flower-thinning/${id}`, "DELETE");
};

// POST - Create Flower Thinning
export const createFlowerThinning = (getToken, flowerThinningData) => {
  return apiRequest(getToken, "/flower-thinning/", "POST", flowerThinningData);
};
