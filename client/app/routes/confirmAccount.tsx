import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Spin, Alert, Layout, Button } from "antd";
import { useAuth } from "../contexts/AuthContext";

const { Content } = Layout;

export default function ConfirmEmailRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmEmail, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setErrorMessage("Missing verification parameters");
      return;
    }

    const verify = async () => {
      try {
        await confirmEmail(userId, token);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "Verification failed");
      }
    };

    verify();
  }, [searchParams, confirmEmail]);

  // If already authenticated (shouldn't happen, but just in case), redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          {status === "loading" && (
            <>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>Confirming your email...</p>
            </>
          )}
          {status === "success" && (
            <Alert
              type="success"
              message="Email confirmed!"
              description="Your email has been successfully verified. You can now log in."
              showIcon
              action={
                <Link to="/login">
                  <Button type="primary">Go to Login</Button>
                </Link>
              }
            />
          )}
          {status === "error" && (
            <Alert
              type="error"
              message="Confirmation failed"
              description={errorMessage}
              showIcon
              action={
                <Link to="/signup">
                  <Button type="primary">Go to Sign Up</Button>
                </Link>
              }
            />
          )}
        </div>
      </Content>
    </Layout>
  );
}