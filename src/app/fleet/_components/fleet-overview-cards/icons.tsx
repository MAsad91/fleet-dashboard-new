import type { SVGProps } from "react";

type SVGPropsType = SVGProps<SVGSVGElement>;

export function TruckIcon(props: SVGPropsType) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#3B82F6" />
      <path
        d="M12 16h16v6H12V16zM28 16h8l2 2v4h-10V16z"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="34" r="2" stroke="#fff" strokeWidth="1.5" />
      <circle cx="32" cy="34" r="2" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function ActiveTripsIcon(props: SVGPropsType) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#10B981" />
      <path
        d="M16 20h16M16 25h16M16 30h12"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="30" r="1.5" fill="#fff" />
    </svg>
  );
}

export function MaintenanceIcon(props: SVGPropsType) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#F59E0B" />
      <path
        d="M18 18l6 6-6 6M24 18l6 6-6 6"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="1.5" fill="#fff" />
    </svg>
  );
}

export function FuelIcon(props: SVGPropsType) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#8B5CF6" />
      <path
        d="M15 28h10l3-6H18l-3 6zM18 12v5l3-2 3 2V12"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 16h6M20 20h6" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}
