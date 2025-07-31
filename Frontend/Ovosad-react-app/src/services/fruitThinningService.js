import { apiRequest } from "./baseService";

// --- FRUIT THINNING SERVICE ---

// GET - Get Fruit Thinning by ID
export const fetchFruitThinningById = (getToken, id) => {
  return apiRequest(getToken, `/fruit-thinning/${id}`, "GET");
};

// GET - Get Fruit Thinnings by list of IDs
export const fetchFruitThinningsByIds = async (getToken, ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const promises = ids.map((id) => fetchFruitThinningById(getToken, id));
  return Promise.all(promises);
};

// PUT - Update Fruit Thinning by ID
export const updateFruitThinning = (getToken, id, fruitThinningData) => {
  return apiRequest(
    getToken,
    `/fruit-thinning/${id}`,
    "PUT",
    fruitThinningData
  );
};

// DELETE - Delete Fruit Thinning by ID
export const deleteFruitThinning = (getToken, id) => {
  return apiRequest(getToken, `/fruit-thinning/${id}`, "DELETE");
};

// POST - Create Fruit Thinning
export const createFruitThinning = (getToken, fruitThinningData) => {
  return apiRequest(getToken, "/fruit-thinning/", "POST", fruitThinningData);
};
