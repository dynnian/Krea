import { Outlet, useSearchParams, useNavigate } from "react-router";
import ImageView from "../routes/image-view";
import { Grid } from "antd";
import UserNavbar from "../components/UserNavbar";
const { useBreakpoint } = Grid;

export default function PublicLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const imageId = searchParams.get("image");
    return (
      <>
        <UserNavbar />

        <main className="flex justify-center px-2 sm:px-4 relative">
          <div className="w-full max-w-7xl flex place-content-center">
            <Outlet />
          </div>

          {imageId && (
            <div
              className="fixed inset-0 bg-black/70 z-[9999] flex"
              onClick={() => navigate(-1)}
            >
              <div
                className="flex w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageView />
              </div>
            </div>
          )}
        </main>
      </>
    );
}