import { Outlet } from "react-router";
import UserNavbar from "../components/UserNavbar";

export default function MainLayout() {
  return (
    <>
      <UserNavbar />
      <main className="flex justify-center py-4 px-2 sm:py-8 sm:px-4">
        <div className="w-full max-w-[740px]">
          <Outlet />
        </div>
      </main>
    </>
  );
}