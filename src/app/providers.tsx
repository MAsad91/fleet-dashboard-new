"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { Provider } from "react-redux";
import { store } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider 
        defaultTheme="system" 
        attribute="class"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <WebSocketProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
