const API_BASE_URL = "/api/v1";

/**
A generic helper function for making authenticated API request
  - getToken - Function to retrieve the authentication token
  - url - The API endpoint path
  - method - The HTTP method "GET", "POST", "PUT", "DELETE").
  - [body=null] - The request body for POST/PUT methods.
  - {Promise<object>} The parsed JSON response or a success message for no-content responses
  - {Error} If the API request fails or token is not available
 */
export const apiRequest = async (
  getToken,
  url,
  method = "GET",
  body = null
) => {
  const token = await getToken();

  // Check for access token
  if (!token) {
    throw new Error(
      "Access token not available. User might not be authenticated."
    );
  }

  const headers = {
    // Only set Content-Type for methods that send a body
    ...(body && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
  };

  const config = {
    method,
    headers,
    // Body only if provided
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    // Parse error detail from response, otherwise provide a generic message
    const errorData = await response.json().catch(() => ({
      detail: `API request failed with status ${response.status}`,
    }));
    throw new Error(
      errorData.detail || `Failed to perform operation: ${response.status}`
    );
  }

  // Check if response has content to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    // For successful requests with no content
    return { status: response.status, message: "Operation successful" };
  }
};
