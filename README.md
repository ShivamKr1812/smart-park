# SmartPark: Smart Parking Platform

SmartPark is a scalable, premium parking slot search and booking platform. It features role-based dashboards (Parker, Owner, Admin), interactive vector SVG street density maps, active timer passes, UPI/Wallet payment simulators, media uploading capabilities, and an automated AI customer support chatbot.

---

## Technical Stack

* **Frontend**: React (Create React App), Vanilla CSS, Lucide React Icons
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (relational database tables mapping)
* **Hosting**: Vercel (Frontend), Render (Backend), Render Database (PostgreSQL)

---

## Folder Structure

```
smart-park/
├── backend/
│   ├── uploads/            # Local media directory (Git ignored)
│   ├── .env.example        # Backend env template
│   ├── server.js           # Server application
│   ├── package.json
│   └── db.json             # Fallback JSON mock database (Git ignored)
├── frontend/
│   ├── src/
│   │   ├── components/     # Redesigned premium pages and panels
│   │   ├── api.js          # API client endpoints
│   │   ├── App.js          # Main app router
│   │   └── App.css         # HSL variable stylesheet
│   ├── vercel.json         # Vercel SPA redirects
│   ├── .env.example        # Frontend env template
│   └── package.json
├── render.yaml             # Render deployment blueprint
├── .gitignore              # Monorepo git ignore rules
├── .env.example            # Root env template
└── README.md               # Operations manual
```

---

## Database Migrations (PostgreSQL)

Upon establishing a connection to PostgreSQL, the backend server automatically runs schema checks and alter migrations. It creates and configures the following tables:

1. **`users`**:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `email` (VARCHAR)
   - `password` (VARCHAR) - Encrypted using `bcryptjs`
   - `phone` (VARCHAR)
   - `role` (VARCHAR) - Defaults to `'parker'`
   - `wallet` (DECIMAL) - Defaults to `450.00`
   - `vehicles` (JSONB) - Holds list of user fleet objects

2. **`parkings`**:
   - `id` (SERIAL PRIMARY KEY)
   - `title` (VARCHAR)
   - `location` (VARCHAR)
   - `price` (DECIMAL)
   - `phone` (VARCHAR)
   - `owner_id` (VARCHAR)
   - `rating` (DECIMAL) - Defaults to `0`
   - `total_ratings` (INTEGER) - Defaults to `0`
   - `slots` (JSONB) - Holds slot counts by vehicle type

3. **`bookings`**:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (VARCHAR)
   - `parking_id` (VARCHAR)
   - `parking_name` (VARCHAR)
   - `location` (VARCHAR)
   - `vehicle_type` (VARCHAR)
   - `price` (DECIMAL)
   - `date` (TIMESTAMP) - Defaults to `CURRENT_TIMESTAMP`
   - `status` (VARCHAR) - Defaults to `'Completed'`

---

## Local Installation

### 1. Clone & Set Up Env
```bash
git clone https://github.com/ShivamKr1812/smart-park.git
cd smart-park
```
Copy `.env.example` in both folders and add your credentials:
- **Backend env variables**: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.
- **Frontend env variables**: `REACT_APP_API_URL`.

### 2. Start Backend API
```bash
cd backend
npm install
node server.js
```
Starts backend on `http://localhost:5000`.

### 3. Start Frontend UI
```bash
cd ../frontend
npm install
npm start
```
Starts React on `http://localhost:3000`.

---

## API Documentation

### Authentication & Profiles
* `POST /signup`: Register a user profile. Encrypts password. Returns `{ token, user }`.
* `POST /login`: Log in a user. Validates bcrypt password hash. Returns `{ token, user }`.
* `POST /user/update`: Update user details, recharge wallet, or edit vehicles.

### Parking Spaces
* `GET /all`: Fetch all registered parking spaces.
* `GET /owner/:ownerId`: Fetch all parking spaces registered by specific owner ID.
* `POST /add`: Register a new parking garage.
* `PUT /update/:id`: Update coordinates or capacity details of a parking spot.
* `DELETE /delete/:id`: Delete a parking spot.

### Bookings & Reviews
* `POST /book`: Reserve a slot. Deducts price from user's wallet.
* `GET /history/:userId`: Fetch list of past bookings for a user.
* `PUT /rate/:id`: Add review rating score to a garage.

### System Utilities
* `GET /health`: Returns backend API and database connection states.
* `POST /upload`: Handles single file uploads (MIMEs: PNG, JPG, JPEG, MP4. Max size: 10MB images, 100MB videos).

---

## Deploying to Render (Backend + Database)

1. Sign in to your **Render Console**.
2. Click **New** → **Blueprint**.
3. Select your GitHub repository.
4. Render will process [render.yaml](file:///c:/Users/LENOVO/Desktop/Parking%20app/render.yaml) and automatically create:
   - A managed **PostgreSQL Database** instance.
   - An Express **Web Service** with connection strings automatically mapped.
5. In the Web Service configuration, supply the `CLIENT_URL` environment variable containing your Vercel deployment link.

---

## Deploying to Vercel (Frontend)

1. Sign in to your **Vercel Dashboard**.
2. Click **Add New** → **Project**.
3. Select your GitHub repository.
4. Set the **Root Directory** option to `frontend`.
5. Under Build and Development settings, Vercel will automatically run `npm run build` and output static assets.
6. Add the following environment variable:
   - `REACT_APP_API_URL`: Set to your Render backend API URL (e.g. `https://your-api.onrender.com`).
7. Click **Deploy**. Vercel will resolve redirects using the [vercel.json](file:///c:/Users/LENOVO/Desktop/Parking%20app/frontend/vercel.json) parameters.
