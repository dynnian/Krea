import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/login",
    file: "routes/login.tsx",
  },
  {
    file: "routes/protected.tsx",
    children: [
      {
        index: true,
        file: "routes/home.tsx",
      },
    ],
  },
] satisfies RouteConfig;
