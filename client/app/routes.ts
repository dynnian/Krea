import type { RouteConfig } from "@react-router/dev/routes";

export default [
  // Rutas públicas sin layout (login, signup, confirmAccount)
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

  // Layout público para todas las páginas internas (con navbar y sidebar)
  {
    file: "layouts/PublicLayout.tsx",
    children: [
      // Página de inicio (feed)
      {
        index: true,
        file: "routes/home.tsx",
      },
      // Detalle de publicación
      {
        path: "post/:id",
        file: "routes/post.tsx",
      },
      // Exploración (búsqueda por tags/categorías)
      {
        path: "explore",
        file: "routes/explore.tsx",
      },
      // Rutas protegidas (heredan el layout público y además verifican autenticación)
      {
        file: "routes/protected.tsx",
        children: [
          {
            path: "profile",
            file: "routes/profile.tsx",
          },
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
    ],
  },
] satisfies RouteConfig;
