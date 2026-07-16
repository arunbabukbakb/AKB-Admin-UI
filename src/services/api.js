import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';
  if (url && !url.endsWith('/')) {
    url += '/';
  }
  return url;
};

const TOKEN_KEY = import.meta.env.VITE_TOKEN_NAME || 'auth_user';

// Create a generic Axios instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Automatically inject authentication tokens if available
apiClient.interceptors.request.use(
  (config) => {
    const authUser = localStorage.getItem(TOKEN_KEY);
    if (authUser) {
      const parsed = JSON.parse(authUser);
      // If your backend token is inside the user object, extract it here
      const token = parsed.token || 'mock_token_123';
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detects an ASP.NET Core validation-error response:
 *   { title, status, errors: { Field: ["msg", ...], ... } }
 * Returns a human-readable, newline-joined string or null if not that shape.
 */
const extractValidationErrors = (data) => {
  if (
    data &&
    typeof data === 'object' &&
    data.errors &&
    typeof data.errors === 'object' &&
    !Array.isArray(data.errors)
  ) {
    const messages = Object.entries(data.errors)
      .flatMap(([field, msgs]) =>
        (Array.isArray(msgs) ? msgs : [msgs]).map((m) => `${field}: ${m}`)
      );
    if (messages.length > 0) return messages.join('\n');
  }
  return null;
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return raw data directly for a cleaner caller syntax
  },
  (error) => {
    const response = error.response;

    if (response) {
      const { status, data } = response;

      // ── ASP.NET Core model-validation errors (400 with `errors` map) ──────
      const validationMsg = extractValidationErrors(data);
      if (validationMsg) {
        // Attach the friendly message so slices can read error.message directly
        error.message = validationMsg;
        console.warn('[API Validation]', validationMsg);
        return Promise.reject(error);
      }

      // ── Standard HTTP error handling ──────────────────────────────────────
      if (status === 401) {
        console.error('Session expired or unauthorized. Redirecting to login...');
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Permission denied to access this resource.');
      } else if (status >= 500) {
        console.error('Server side database or API processing exception occurred.');
      }
    } else {
      console.error('Network or connection exception. Please verify backend state.');
    }

    return Promise.reject(error);
  }
);

// Generic Wrapper HTTP Methods
const apiService = {
  get: (endpoint, config = {}) => {
    return apiClient.get(endpoint, config);
  },

  post: (endpoint, data = {}, config = {}) => {
    return apiClient.post(endpoint, data, config);
  },

  put: (endpoint, data = {}, config = {}) => {
    return apiClient.put(endpoint, data, config);
  },

  delete: (endpoint, config = {}) => {
    return apiClient.delete(endpoint, config);
  },

  patch: (endpoint, data = {}, config = {}) => {
    return apiClient.patch(endpoint, data, config);
  }
};

export default apiService;
