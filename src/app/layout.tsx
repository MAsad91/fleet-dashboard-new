import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { ConditionalLayout } from "@/components/Layouts/ConditionalLayout";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Fleet Management Dashboard",
    default: "Fleet Management Dashboard",
  },
  description:
    "Fleet Management Dashboard - Real-time vehicle tracking, maintenance scheduling, and fleet analytics.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
