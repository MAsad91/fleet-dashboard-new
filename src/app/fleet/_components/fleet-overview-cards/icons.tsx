import { Car, CheckCircle, MapPin, AlertTriangle, Wrench, Battery, Gauge } from "lucide-react";
import type { SVGProps } from "react";

type SVGPropsType = SVGProps<SVGSVGElement>;

// Total Vehicles Icon - Blue background
export function TruckIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
      <Car className="w-6 h-6 text-white" />
    </div>
  );
}

// Online Vehicles Icon - Green background
export function OnlineVehiclesIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
      <CheckCircle className="w-6 h-6 text-white" />
    </div>
  );
}

// Active Trips Icon - Green background
export function ActiveTripsIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
      <MapPin className="w-6 h-6 text-white" />
    </div>
  );
}

// Critical Alerts Icon - Orange background
export function CriticalAlertsIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
      <AlertTriangle className="w-6 h-6 text-white" />
    </div>
  );
}

// Open Maintenance Icon - Orange background
export function MaintenanceIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
      <Wrench className="w-6 h-6 text-white" />
    </div>
  );
}

// Battery Icon - Purple background
export function BatteryIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
      <Battery className="w-6 h-6 text-white" />
    </div>
  );
}

// Distance Icon - Purple background
export function DistanceIcon(props: SVGPropsType) {
  return (
    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
      <Gauge className="w-6 h-6 text-white" />
    </div>
  );
}
