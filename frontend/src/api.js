// Mock API Service simulating backend operations via localStorage
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Initial seed data if nothing exists
if (!localStorage.getItem('parkings')) setStorage('parkings', []);
if (!localStorage.getItem('users')) setStorage('users', []);
if (!localStorage.getItem('bookingHistory')) setStorage('bookingHistory', []);

export const api = {
  // Auth
  async signup(data) {
    await delay(600);
    const users = getStorage('users');
    if (users.find((u) => u.email === data.email)) {
      throw new Error("Email already registered");
    }
    const newUser = { _id: Date.now().toString(), ...data };
    users.push(newUser);
    setStorage('users', users);
    return { data: newUser };
  },

  async login(credentials) {
    await delay(600);
    const users = getStorage('users');
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);
    if (!user) throw new Error("Invalid email or password");
    if (!user.role) user.role = 'user';
    return { data: user };
  },

  // Parkings
  async getAllParkings() {
    await delay(800);
    return { data: getStorage('parkings') };
  },

  async getOwnerParkings(ownerId) {
    await delay(800);
    const parkings = getStorage('parkings');
    return { data: parkings.filter(p => p.ownerId === ownerId) };
  },

  async addParking(data, ownerId) {
    await delay(600);
    const parkings = getStorage('parkings');
    const newParking = {
      ...data,
      _id: Date.now().toString(),
      ownerId,
      rating: 0,
      totalRatings: 0
    };
    parkings.push(newParking);
    setStorage('parkings', parkings);
    return { data: newParking };
  },

  async updateParking(id, updates) {
    await delay(600);
    const parkings = getStorage('parkings');
    const index = parkings.findIndex(p => p._id === id);
    if (index === -1) throw new Error("Parking not found");
    parkings[index] = { ...parkings[index], ...updates };
    setStorage('parkings', parkings);
    return { data: parkings[index] };
  },

  async deleteParking(id) {
    await delay(500);
    const parkings = getStorage('parkings');
    setStorage('parkings', parkings.filter(p => p._id !== id));
    return { data: { success: true } };
  },

  async bookParking(parkingId, vehicleType, userId) {
    await delay(600);
    const parkings = getStorage('parkings');
    const parking = parkings.find(p => p._id === parkingId);
    if (!parking) throw new Error("Not found");

    const slotData = parking.slots.find(s => s.type === vehicleType);
    if (!slotData || slotData.available <= 0) throw new Error("No slots available for this vehicle");

    slotData.available -= 1;
    setStorage('parkings', parkings);

    // Save booking to history
    if (userId) {
      this.saveBooking(userId, {
        parkingId,
        parkingName: parking.title,
        location: parking.location,
        vehicleType,
        price: parking.price,
        date: new Date().toISOString(),
        status: 'Completed'
      });
    }

    return { data: parking };
  },

  saveBooking(userId, booking) {
    const history = getStorage('bookingHistory');
    history.unshift({
      _id: Date.now().toString(),
      userId,
      ...booking
    });
    setStorage('bookingHistory', history);
  },

  async getBookingHistory(userId) {
    await delay(500);
    const history = getStorage('bookingHistory');
    const userHistory = history.filter(b => b.userId === userId);

    // Seed demo data for first-time users with no history
    if (userHistory.length === 0) {
      const demoBookings = [
        {
          _id: 'demo-1',
          userId,
          parkingName: 'City Center Mall Parking',
          location: 'Connaught Place, New Delhi',
          vehicleType: 'Car',
          price: 80,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Completed'
        },
        {
          _id: 'demo-2',
          userId,
          parkingName: 'Tech Park Secure Lot',
          location: 'Whitefield, Bengaluru',
          vehicleType: 'Bike',
          price: 30,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Completed'
        },
        {
          _id: 'demo-3',
          userId,
          parkingName: 'Airport Express Parking',
          location: 'IGI Airport, New Delhi',
          vehicleType: 'Car',
          price: 120,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Completed'
        }
      ];
      return { data: demoBookings };
    }

    return { data: userHistory };
  },

  async rateParking(parkingId, newRating) {
    await delay(400);
    const parkings = getStorage('parkings');
    const parking = parkings.find(p => p._id === parkingId);
    if (!parking) throw new Error("Not found");

    const totalRatings = parking.totalRatings || 0;
    const currentRating = parking.rating || 0;
    parking.rating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);
    parking.totalRatings = totalRatings + 1;

    setStorage('parkings', parkings);
    return { data: parking };
  }
};
