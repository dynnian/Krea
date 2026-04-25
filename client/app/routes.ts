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
      // Vista de imagen individual (modal)
      {
        path: "image-view",
        file: "routes/image-view.tsx",
      },
      // Vista de Album.
      {
        path: "album/:id",
        file: "routes/album.tsx",
      },
      // Reader de literatura PDF/EPUB
      {
        path: "read/:postId",
        file: "routes/read.tsx",
      },
      // Exploración (búsqueda por tags/categorías)
      {
        path: "explore",
        file: "routes/explore.tsx",
      },
      {
        path: 'user/:userId',
        file: 'routes/userProfile.tsx',
      },
      // Rutas protegidas (heredan el layout público y además verifican autenticación)
      {
        file: "routes/protected.tsx",
        children: [
          {
            path: "profile",
            file: "routes/profile.tsx",
          },
          {
            path: "commissions",
            file: "routes/commissions.tsx",
          },
          {
            path: "subscriptions",
            file: "routes/subscriptions.tsx",
          },
          {
            path: "commissions/:commissionId",
            file: "routes/commission-detail.tsx",
          },
          {
            path: "settings",
            file: "routes/settings.tsx",
          },
          {
            path: "messages",
            file: "routes/chat.tsx",
          },
          {
            path: "saved",
            file: "routes/bookmarks.tsx",
          },
        ],
      },
    ],
  },
   // Layout para administradores (bajo /admin)
  {
    path: "admin",
    file: "layouts/AdminLayout.tsx",
    children: [
      {
        // Dentro de /admin, usamos el guardian para verificar rol
        file: "routes/admin-protected.tsx",
        children: [
          {
            index: true,
            file: "routes/admin/dashboard.tsx", 
          },
          { path: "users", file: "routes/admin/users.tsx" },     
          { path: "reports", file: "routes/admin/reports.tsx" }, 
          { path: "federation", file: "routes/admin/federation.tsx" }, 
          { path: "settings", file: "routes/admin/settings.tsx" }, 
        ],
      },
    ],
  }
] satisfies RouteConfig;
