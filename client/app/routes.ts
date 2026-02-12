import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/home.tsx",
  },
  {
    path: "/login",
    file: "routes/login.tsx",
  },
  {
    path: "/signup",
    file: "routes/signup.tsx",
  },
  {
    path: "/confirmAccount",
    file: "routes/confirmAccount.tsx",
  },
  {
    file: "routes/protected.tsx",
    children: [
      // {
      //   path: "profile",
      //   file: "routes/protected/profile.tsx",
      // },
      // {
      //   path: "messages",
      //   file: "routes/protected/messages.tsx",
      // },
      // {
      //   path: "settings",
      //   file: "routes/protected/settings.tsx",
      // },
    ],
  },
] satisfies RouteConfig;
