import { apiRequest } from "./baseService";

// --- AGENT SERVICE ---

// GET - Get all Agents (Mastertable)
export const fetchAllAgents = (getToken) => {
  return apiRequest(getToken, "/agent/", "GET");
};

// POST - Create Agent
export const createAgent = (getToken, agentData) => {
  return apiRequest(getToken, "/agent/", "POST", agentData);
};

// GET - Get Agent by ID
export const fetchAgentById = (getToken, id) => {
  return apiRequest(getToken, `/agent/${id}`, "GET");
};

// PUT - Update Agent by ID
export const updateAgent = (getToken, id, agentData) => {
  return apiRequest(getToken, `/agent/${id}`, "PUT", agentData);
};

// DELETE - Delete Agent by ID
export const deleteAgent = (getToken, id) => {
  return apiRequest(getToken, `/agent/${id}`, "DELETE");
};
