# Restaurant Reservation Platform

A modern, full-stack restaurant reservation and management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### For Customers
- Browse restaurants with detailed information
- Make and manage reservations
- Write and read reviews
- User profile management
- Secure payment processing

### For Restaurant Owners
- Restaurant profile management
- Menu management
- Reservation handling
- Real-time dashboard with statistics
- Review management

### For Administrators
- Restaurant approval and management
- User management
- System-wide statistics
- Content moderation

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Chart.js for analytics
- Axios for API requests
- Socket.io client for real-time features

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image storage
- Razorpay for payments
- Socket.io for real-time updates

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/cyber-traveller/dineease.git
cd restaurant-reservation-platform
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
# Start frontend development server
npm run dev

# Start backend server
npm run server
```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### Restaurant Endpoints
- GET `/api/restaurants` - List all restaurants
- GET `/api/restaurants/:id` - Get restaurant details
- POST `/api/owner/restaurant` - Create restaurant (owner only)
- PUT `/api/owner/restaurant/:id` - Update restaurant (owner only)

### Reservation Endpoints
- POST `/api/reservations` - Create reservation
- GET `/api/reservations/user` - Get user's reservations
- GET `/api/owner/reservations` - Get restaurant's reservations (owner only)

### Review Endpoints
- POST `/api/reviews` - Create review
- GET `/api/reviews/restaurant/:id` - Get restaurant reviews
- PATCH `/api/reviews/:id` - Update review status (admin only)

## User Credentials

### User
```
Email: johndoe@example.com
Password: userPassword123
```

### Owner
```
Email: janesmith@example.com
Password: ownerPassword123
```

### Admin
```
Email: admin@example.com
Password: admin123
```

## Deployment

The application can be deployed using platforms like Heroku, Vercel, or AWS:

1. Build the frontend
```bash
npm run build
```

2. Set up environment variables on your hosting platform

3. Deploy the application following your hosting platform's guidelines

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js team for the excellent frontend framework
- MongoDB team for the powerful database solution
- All contributors and supporters of the project

