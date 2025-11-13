import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LingoBros - Học Tiếng Anh Trực Tuyến",
  description: "Ứng dụng học tiếng Anh thông minh với AI, giống như Duolingo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac',
                  },
                  className: 'dark:!bg-green-950 dark:!text-green-100 dark:!border-green-800',
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                  },
                  className: 'dark:!bg-red-950 dark:!text-red-100 dark:!border-red-800',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

