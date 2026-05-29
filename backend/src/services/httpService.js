export const fetchJson = async (url, options = {}, retries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { accept: "application/json", ...(options.headers || {}) }
      });
      if (response.status === 429) throw new Error("Remote API rate limit reached");
      if (!response.ok) throw new Error(`Remote API error ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  throw lastError;
};
