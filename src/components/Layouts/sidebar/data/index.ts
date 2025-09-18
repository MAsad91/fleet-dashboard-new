import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "FLEET MANAGEMENT",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/fleet",
        items: [],
      },
      {
        title: "Vehicles",
        icon: Icons.TruckIcon,
        items: [
          {
            title: "All Vehicles",
            url: "/fleet/vehicles",
          },
          {
            title: "Vehicle Details",
            url: "/fleet/vehicles/details",
          },
          {
            title: "Add Vehicle",
            url: "/fleet/vehicles/add",
          },
        ],
      },
      {
        title: "Drivers",
        icon: Icons.DriverIcon,
        url: "/drivers",
        items: [],
      },
      {
        title: "Trips",
        icon: Icons.MapIcon,
        url: "/trips",
        items: [],
      },
      {
        title: "Alerts",
        icon: Icons.AlertIcon,
        url: "/alerts",
        items: [],
      },
      {
        title: "OBD Devices",
        icon: Icons.SettingsIcon,
        url: "/obd-devices",
        items: [],
      },
      {
        title: "Maintenance",
        icon: Icons.WrenchIcon,
        url: "/maintenance",
        items: [],
      },
      {
        title: "Dashcams",
        icon: Icons.VideoIcon,
        url: "/dashcams",
        items: [],
      },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      {
        title: "Fuel Analytics",
        icon: Icons.FuelIcon,
        url: "/fleet/fuel",
        items: [],
      },
      {
        title: "Energy Consumption",
        icon: Icons.PieChart,
        url: "/fleet/energy",
        items: [],
      },
      {
        title: "Performance Reports",
        icon: Icons.Table,
        url: "/fleet/reports",
        items: [],
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        title: "Notifications",
        icon: Icons.BellIcon,
        url: "/fleet/notifications",
        items: [],
      },
      {
        title: "Profile",
        icon: Icons.User,
        url: "/profile",
        items: [],
      },
      {
        title: "Help & Support",
        icon: Icons.FourCircle,
        url: "/fleet/support",
        items: [],
      },
    ],
  },
];
