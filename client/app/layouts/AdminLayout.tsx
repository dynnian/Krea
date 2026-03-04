import { Outlet } from "react-router";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

export default function AdminLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      <main className="flex justify-center px-2 sm:px-4">
        <div className="w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </>
  );
}