// routes/home.tsx
import { useAuth } from "../contexts/AuthContext";
import HomeComponent from "../components/Home.tsx"; // o el código inline

export default function HomeRoute() {
  const { user } = useAuth(); // null si no autenticado

  return <HomeComponent user={user} />;
}