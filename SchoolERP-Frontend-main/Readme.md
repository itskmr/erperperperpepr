# School Management System (SMS) - Client

## Overview

A comprehensive web-based School Management System built with React, TypeScript, and modern web technologies. This client application provides an intuitive interface for managing all aspects of school operations including student management, teacher management, fee collection, reporting, and more.

## Features

- **Dashboard**: Overview of key metrics and school performance indicators
- **Student Management**: Registration, profile management, and academic tracking
- **Teacher Management**: Staff profiles and assignment tracking
- **Fee Management**: Fee structure configuration and payment processing
- **User Management**: Role-based access control for different user types
- **Reporting**: Comprehensive reporting with export capabilities
- **Notifications**: In-app notification system for important updates

## Tech Stack

- **Framework**: React with TypeScript
- **State Management**: Recoil, Zustand
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Material UI
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Chart.js, Recharts
- **API Communication**: React Query
- **Build Tool**: Vite
- **Payment Integration**: Stripe, Razorpay

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/school-management-system.git
   cd school-management-system/client
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env` (if not already present)
   - Update the variables as needed

4. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Build for production
   ```
   npm run build
   # or
   yarn build
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/         # Configuration files
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and configurations
├── pages/          # Application pages
├── recoil/         # Recoil state management
├── services/       # API service calls
├── types/          # TypeScript type definitions
└── utils/          # Helper utilities
```

## API Integration

The client communicates with a backend server for data operations. Make sure the server is running and properly configured in the `.env` file.

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file includes the necessary configuration.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All contributors who have helped build this system
- The open-source libraries and frameworks that made this possible 