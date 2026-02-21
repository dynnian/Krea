import { Outlet } from "react-router";
import { Grid } from "antd";
import UserNavbar from "../components/UserNavbar";
import TagsSidebar from "../components/Home/TagsSidebar";

const { useBreakpoint } = Grid;

export default function PublicLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      <UserNavbar />
      <main className="flex justify-center px-2 sm:px-4">
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl w-full place-content-center">
          {/* Columna principal (feed o contenido) */}
          <div className="w-full md:w-[740px]">
            <Outlet />
          </div>
          {/* Sidebar de tags (solo en desktop) */}
          {!isMobile && (
            <div className="w-full md:w-64 flex-shrink-0 py-2">
              <TagsSidebar />
            </div>
          )}
        </div>
      </main>
    </>
  );
}