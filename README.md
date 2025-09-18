# Fleet Management Dashboard

A comprehensive fleet management dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Redux Toolkit. This application provides real-time fleet monitoring, vehicle tracking, driver management, and maintenance scheduling capabilities.

![Fleet Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)

## 🚀 Features

### Core Dashboard
- **Real-time Fleet Overview** - Live monitoring of fleet status, active trips, and maintenance alerts
- **Interactive Maps** - Real-time vehicle tracking with map and list views
- **Analytics & Reporting** - Comprehensive fleet analytics with charts and metrics
- **Responsive Design** - Mobile-first design that works on all devices

### Vehicle Management
- **Vehicle Tracking** - Real-time location and status monitoring
- **OBD Integration** - Vehicle diagnostics and health monitoring
- **Maintenance Scheduling** - Automated maintenance reminders and tracking
- **Fuel Efficiency** - Monitor fuel consumption and efficiency metrics

### Driver Management
- **Driver Profiles** - Complete driver information and performance tracking
- **Trip Management** - Start, monitor, and complete trips
- **Performance Analytics** - Driver performance metrics and reporting

### Alert System
- **Real-time Alerts** - Critical alerts for maintenance, safety, and operational issues
- **Alert Management** - Acknowledge, resolve, and track alert status
- **Severity Levels** - Categorized alerts with priority management

### Maintenance & Diagnostics
- **Scheduled Maintenance** - Automated maintenance scheduling and tracking
- **OBD Device Management** - Monitor and manage OBD devices
- **Battery Health** - Real-time battery monitoring with animated indicators
- **Device Health** - System health monitoring and diagnostics

### Dashcam Integration
- **Video Management** - Dashcam footage management and storage
- **API Key Management** - Secure API key generation and refresh
- **Status Monitoring** - Real-time dashcam status and connectivity

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Redux Toolkit with RTK Query
- **Charts**: ApexCharts for data visualization
- **Authentication**: JWT-based authentication system
- **Icons**: Lucide React for consistent iconography
- **UI Components**: Custom component library

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MAsad91/fleet-dashboard-new.git
   cd fleet-dashboard-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_DEMO_EMAIL=demo@fleet.com
   NEXT_PUBLIC_DEMO_PASSWORD=demo123
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── fleet/             # Main dashboard
│   ├── vehicles/          # Vehicle management
│   ├── drivers/           # Driver management
│   ├── trips/             # Trip management
│   ├── alerts/            # Alert management
│   ├── maintenance/       # Maintenance scheduling
│   ├── obd-devices/       # OBD device management
│   └── dashcams/          # Dashcam management
├── components/            # Reusable UI components
│   ├── Auth/             # Authentication components
│   ├── Layouts/          # Layout components
│   └── ui-elements/      # UI component library
├── store/                # Redux store configuration
│   ├── api/              # RTK Query API slices
│   └── slices/           # Redux slices
└── lib/                  # Utility functions
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 API Integration

The dashboard integrates with a comprehensive fleet management API that provides:

- **Dashboard Summary** - Fleet overview statistics
- **Vehicle Management** - CRUD operations for vehicles
- **Driver Management** - Driver profiles and management
- **Trip Management** - Trip tracking and management
- **Alert System** - Real-time alert management
- **Maintenance** - Maintenance scheduling and tracking
- **OBD Devices** - Device management and telemetry
- **Dashcams** - Video management and API key handling

## 🎨 UI Components

The project includes a comprehensive set of custom UI components:

- **Charts**: Line charts, bar charts, donut charts, and gauges
- **Tables**: Sortable, filterable data tables with pagination
- **Forms**: Input groups, selects, date pickers, and validation
- **Cards**: Information cards with various layouts
- **Maps**: Interactive maps with real-time tracking
- **Alerts**: Toast notifications and alert components
- **Modals**: Dialog and modal components
- **Navigation**: Sidebar, breadcrumbs, and pagination

## 🌙 Theme Support

- **Light Mode** - Clean, professional light theme
- **Dark Mode** - Modern dark theme for low-light environments
- **System Theme** - Automatic theme detection based on system preferences

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop** - Full-featured dashboard experience
- **Tablet** - Optimized layout for tablet devices
- **Mobile** - Mobile-first design with touch-friendly interfaces

## 🔐 Authentication

- **JWT-based Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, Manager, Operator, and Viewer roles
- **Protected Routes** - Secure page access based on user roles
- **Session Management** - Automatic token refresh and session handling

## 📊 Analytics & Reporting

- **Fleet Overview** - Key performance indicators and metrics
- **Vehicle Status** - Real-time vehicle status breakdown
- **Trip Analytics** - Trip performance and efficiency metrics
- **Maintenance Reports** - Maintenance scheduling and history
- **Alert Trends** - Alert frequency and resolution analytics
- **Fuel Efficiency** - Fuel consumption and efficiency tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Redux Toolkit](https://redux-toolkit.js.org/)
- Charts powered by [ApexCharts](https://apexcharts.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for modern fleet management**