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
        url: "/vehicles",
        items: [
          {
            title: "Vehicle Documents",
            url: "/vehicle-documents",
          },
        ],
      },
      {
        title: "Drivers",
        icon: Icons.DriverIcon,
        url: "/drivers",
        items: [
          {
            title: "Driver Documents",
            url: "/driver-documents",
          },
        ],
      },
      {
        title: "Trips",
        icon: Icons.MapIcon,
        url: "/trips",
        items: [],
      },
      {
        title: "Telemetry",
        icon: Icons.PieChart,
        url: "/telemetry",
        items: [],
      },
      {
        title: "Alerts",
        icon: Icons.AlertIcon,
        url: "/alerts",
        items: [
          {
            title: "Alert Rules",
            url: "/alert-rules",
          },
        ],
      },
      {
        title: "OBD Devices",
        icon: Icons.SettingsIcon,
        url: "/obd-devices",
        items: [],
      },
      {
        title: "SIM Cards",
        icon: Icons.SimCardIcon,
        url: "/sim-cards",
        items: [],
      },
      {
        title: "Maintenance",
        icon: Icons.WrenchIcon,
        url: "/maintenance",
        items: [],
      },
      {
        title: "Insurance",
        icon: Icons.ShieldIcon,
        url: "/insurance",
        items: [],
      },
      {
        title: "Dashcams",
        icon: Icons.VideoIcon,
        url: "/dashcams",
        items: [],
      },
      {
        title: "Firmware",
        icon: Icons.SettingsIcon,
        url: "/firmware-updates",
        items: [],
      },
      {
        title: "Analytics",
        icon: Icons.PieChart,
        url: "/analytics",
        items: [],
      },
      {
        title: "Driver Logs",
        icon: Icons.ClockIcon,
        url: "/driver-logs",
        items: [],
      },
      {
        title: "Performance",
        icon: Icons.Table,
        url: "/performance",
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.SettingsIcon,
        url: "/fleet-settings",
        items: [],
      },
      {
        title: "Users",
        icon: Icons.User,
        url: "/users",
        items: [
          {
            title: "Groups & Permissions",
            url: "/users/groups",
          },
        ],
      },
    ],
  },
];
