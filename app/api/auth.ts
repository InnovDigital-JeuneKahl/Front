// Authentication API functions
import Cookies from "js-cookie"; // ✅ default import, not { Cookies }

// Token storage utilities
export const setToken = (token: string) => {
  Cookies.set('auth_token', token);
};

export const getToken = () => {
  return Cookies.get('auth_token');
};

export const removeToken = () => {
  Cookies.remove('auth_token');
};

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('https://auth-microservice-47kl.onrender.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || 'Login failed');
    }

    const data = await response.json();
    
    // Store the JWT token
    if (data.access_token) {
      setToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    // Get the token for the authorization header
    const token = getToken();
    
    const response = await fetch('https://auth-microservice-47kl.onrender.com/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Remove the token regardless of the response
    removeToken();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || 'Logout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove the token even if the request fails
    removeToken();
    throw error;
  }
}

export async function registerUser(email: string, password: string) {
  try {
    const response = await fetch('https://auth-microservice-47kl.onrender.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Utility function to make authenticated requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}