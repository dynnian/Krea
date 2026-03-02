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
        <div className="w-full max-w-7xl flex place-content-center">
          <Outlet />
        </div>
      </main>
    </>
  );
}