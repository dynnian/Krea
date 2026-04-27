// deno-lint-ignore-file
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./i18n/index.ts"; // i18next init
import type { Route } from "../.react-router/types/app/+types/root.ts";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { I18nProvider } from "./contexts/I18nContext.tsx";
import { ConfigProvider, Grid } from "antd";
import { antdTheme } from "./theme/antDTheme.ts";
const { useBreakpoint } = Grid;

import "antd/dist/reset.css";
import "./app.css";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";
import faviconIcon from "../assets/icon.svg";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: faviconIcon, type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        <ConfigProvider theme={antdTheme}>
          <I18nProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ConfigProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}