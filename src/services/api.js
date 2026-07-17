import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';
  if (url && !url.endsWith('/')) {
    url += '/';
  }
  return url;
};

const TOKEN_KEY = import.meta.env.VITE_TOKEN_NAME || 'auth_user';

let tokenRefreshHandler = null;
let logoutHandler = null;

export const registerTokenRefreshHandler = (handler) => {
  tokenRefreshHandler = handler;
};

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleSessionExpiry = () => {
  localStorage.removeItem(TOKEN_KEY);
  if (logoutHandler) {
    logoutHandler();
  } else {
    window.location.href = '/login';
  }
};

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
        const originalRequest = error.config;

        // Prevent infinite loop if the refresh request itself fails or has already retried
        if (originalRequest._retry || originalRequest.url?.includes('Home/refresh')) {
          console.error('Refresh token failed or request already retried. Logging out...');
          handleSessionExpiry();
          return Promise.reject(error);
        }

        const authUser = localStorage.getItem(TOKEN_KEY);
        if (!authUser) {
          handleSessionExpiry();
          return Promise.reject(error);
        }

        const parsed = JSON.parse(authUser);
        const refreshToken = parsed?.refreshToken;

        if (!refreshToken) {
          handleSessionExpiry();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          axios.post(getBaseUrl() + 'Home/refresh', {
            accessToken: parsed.token,
            refreshToken: refreshToken
          })
          .then((res) => {
            const apiResult = res.data;
            if (apiResult && apiResult.status && apiResult.data) {
              const newTokens = apiResult.data;
              const newAccessToken = newTokens.token;
              const newRefreshToken = newTokens.refreshToken;

              // Update local storage
              parsed.token = newAccessToken;
              parsed.refreshToken = newRefreshToken;
              localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));

              // Update default headers
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

              // Notify Redux store
              if (tokenRefreshHandler) {
                tokenRefreshHandler({ token: newAccessToken, refreshToken: newRefreshToken });
              }

              processQueue(null, newAccessToken);

              // Replay the original request
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              resolve(apiClient(originalRequest));
            } else {
              throw new Error(apiResult?.message || 'Token refresh failed');
            }
          })
          .catch((err) => {
            processQueue(err, null);
            handleSessionExpiry();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
        });
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
