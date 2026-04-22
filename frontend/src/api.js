const API_URL = 'http://localhost:5000';

export const api = {
  // Auth
  async signup(data) {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Signup failed");
    return { data: result };
  },

  async login(credentials) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Login failed");
    return { data: result };
  },

  // Parkings
  async getAllParkings() {
    const res = await fetch(`${API_URL}/all`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to fetch");
    return { data: result };
  },

  async getOwnerParkings(ownerId) {
    const res = await fetch(`${API_URL}/owner/${ownerId}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to fetch");
    return { data: result };
  },

  async addParking(data, ownerId) {
    const payload = {
      ...data,
      ownerId,
      rating: 0,
      totalRatings: 0
    };
    const res = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to add");
    return { data: result };
  },

  async updateParking(id, updates) {
    const res = await fetch(`${API_URL}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update");
    return { data: result };
  },

  async deleteParking(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to delete");
    return { data: result };
  },

  async bookParking(parkingId, vehicleType, userId) {
    const res = await fetch(`${API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parkingId, vehicleType, userId })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Booking failed");
    return { data: result };
  },

  async getBookingHistory(userId) {
    const res = await fetch(`${API_URL}/history/${userId}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to fetch history");
    return { data: result };
  },

  async rateParking(parkingId, newRating) {
    const res = await fetch(`${API_URL}/rate/${parkingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to rate");
    return { data: result };
  }
};
