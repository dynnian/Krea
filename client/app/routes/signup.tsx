import { useForm, Controller, type FieldValues } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Layout,
  Alert,
  Checkbox,
  Grid,
} from "antd";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useI18n } from "../contexts/I18nContext";

const { useBreakpoint } = Grid;
const { Content } = Layout;

interface SignUpDTO extends FieldValues {
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const logoImage = "/assets/Logotipo 1.png";
const backgroundImage = "/assets/landscapeB.jpg";

export default function SignUpRoute() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLanguage } = useI18n();
  
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;

  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpDTO>({
    mode: "onBlur",
    defaultValues: {
      username: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpDTO) => {
    setAuthError(null);
    try {
      // Simulación de registro
      navigate("/confirmAccount", { replace: true });
    } catch {
      setAuthError("Registration failed. Please try again.");
    }
  };

  if (!isMounted) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: 16 
        }}>
          <div style={{ 
            width: "100%", 
            maxWidth: 400 
          }}>
            <div style={{ 
              height: 100, 
              backgroundColor: "#f0f0f0", 
              borderRadius: 12, 
              marginBottom: 24 
            }} />
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                style={{ 
                  height: 40, 
                  backgroundColor: "#f0f0f0", 
                  borderRadius: 8, 
                  marginBottom: 12 
                }} 
              />
            ))}
            <div style={{ 
              height: 44, 
              backgroundColor: "#e0e0e0", 
              borderRadius: 22,
              marginTop: 16
            }} />
          </div>
        </Content>
      </Layout>
    );
  }

  // Campos del formulario en orden
  const formFields = [
    { 
      name: "username" as const, 
      placeholder: t("signup.username"),
      type: "text" as const,
      rules: {
        required: `${t("signup.username")} is required`
      }
    },
    { 
      name: "phone" as const, 
      placeholder: t("signup.phone"),
      type: "text" as const,
      rules: {
        required: `${t("signup.phone")} is required`
      }
    },
    { 
      name: "email" as const, 
      placeholder: t("signup.email"),
      type: "text" as const,
      rules: {
        required: `${t("signup.email")} is required`,
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Please enter a valid email"
        }
      }
    },
    { 
      name: "password" as const, 
      placeholder: t("signup.password"),
      type: "password" as const,
      rules: {
        required: `${t("signup.password")} is required`,
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters"
        }
      }
    },
    { 
      name: "confirmPassword" as const, 
      placeholder: t("signup.confirmPassword"),
      type: "password" as const,
      rules: {
        required: `${t("signup.confirmPassword")} is required`,
        validate: (value: string) => value === password || "Passwords do not match"
      }
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {isMobile ? (
          // Mobile view
          <div style={{
            width: "100%",
            maxWidth: 400,
            padding: 20
          }}>
            <div style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  style={{ width: 100, height: "auto", marginBottom: 16 }}
                />
                <h2 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 500 }}>
                  {t("signup.title")}
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  {t("signup.welcome")}
                </p>
              </div>
              
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {authError && (
                  <Alert
                    type="error"
                    message={authError}
                    closable
                    onClose={() => setAuthError(null)}
                    style={{ marginBottom: 16 }}
                  />
                )}

                {formFields.map((field) => (
                  <Form.Item
                    key={field.name}
                    validateStatus={errors[field.name] ? "error" : ""}
                    help={errors[field.name]?.message}
                    style={{ marginBottom: 12 }}
                  >
                    <Controller
                      name={field.name}
                      control={control}
                      rules={field.rules}
                      render={({ field: controllerField }) => (
                        field.type === "password" ? (
                          <Input.Password
                            {...controllerField}
                            placeholder={field.placeholder}
                            size="middle"
                            style={{ 
                              height: 40,
                              borderRadius: 8,
                              fontSize: 14
                            }}
                          />
                        ) : (
                          <Input
                            {...controllerField}
                            placeholder={field.placeholder}
                            size="middle"
                            style={{ 
                              height: 40,
                              borderRadius: 8,
                              fontSize: 14
                            }}
                          />
                        )
                      )}
                    />
                  </Form.Item>
                ))}

                <Form.Item style={{ marginBottom: 20 }}>
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ fontSize: 14 }}
                  >
                    {t("signup.remember_me")}
                  </Checkbox>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  block
                  loading={isSubmitting}
                  style={{ 
                    height: 44,
                    borderRadius: 22,
                    fontSize: 14
                  }}
                >
                  {isSubmitting ? t("signup.sign_up_button") + "..." : t("signup.sign_up_button")}
                </Button>

                <div style={{ 
                  textAlign: "center", 
                  marginTop: 20, 
                  paddingTop: 16, 
                  borderTop: "1px solid #f0f0f0",
                  fontSize: 14 
                }}>
                  <span style={{ color: "#666", marginRight: 8 }}>
                    {t("signup.have_account")}
                  </span>
                  <Link to="/login" style={{ color: "#1890ff", textDecoration: "none" }}>
                    {t("signup.login_link")}
                  </Link>
                </div>
              </Form>
            </div>
          </div>
        ) : (
          // Desktop view
          <div style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            backgroundImage: `linear-gradient(46deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.55) 100%), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div style={{
              backgroundColor: "rgba(27, 28, 30, 0.30)",
              backdropFilter: "blur(10px)",
              borderRadius: 20,
              padding: 40,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)"
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                gap: 24
              }}>
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  style={{ 
                    width: 200,
                    height: "auto" 
                  }}
                />
                
                <h1 style={{ 
                  color: "#F3F3F1", 
                  textAlign: "center", 
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 500
                }}>
                  {t("signup.welcome")}
                </h1>

                <div style={{ width: "100%" }}>
                  <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    {authError && (
                      <Alert
                        type="error"
                        message={authError}
                        closable
                        onClose={() => setAuthError(null)}
                        style={{ marginBottom: 20 }}
                      />
                    )}

                    {formFields.map((field) => (
                      <Form.Item
                        key={field.name}
                        validateStatus={errors[field.name] ? "error" : ""}
                        help={errors[field.name]?.message}
                        style={{ marginBottom: 16 }}
                      >
                        <Controller
                          name={field.name}
                          control={control}
                          rules={field.rules}
                          render={({ field: controllerField }) => (
                            field.type === "password" ? (
                              <Input.Password
                                {...controllerField}
                                placeholder={field.placeholder}
                                size="large"
                                style={{
                                  height: 44,
                                  backgroundColor: "#F3F3F1",
                                  border: "2px solid #1B1C1E",
                                  borderRadius: 12,
                                  color: "#8F8E8A",
                                  fontSize: 14,
                                  padding: "0 16px"
                                }}
                              />
                            ) : (
                              <Input
                                {...controllerField}
                                placeholder={field.placeholder}
                                size="large"
                                style={{
                                  height: 44,
                                  backgroundColor: "#F3F3F1",
                                  border: "2px solid #1B1C1E",
                                  borderRadius: 12,
                                  color: "#8F8E8A",
                                  fontSize: 14,
                                  padding: "0 16px"
                                }}
                              />
                            )
                          )}
                        />
                      </Form.Item>
                    ))}

                    <Form.Item style={{ marginBottom: 24 }}>
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ 
                          color: "#F3F3F1", 
                          fontSize: 14,
                          fontWeight: 500
                        }}
                      >
                        {t("signup.remember_me")}
                      </Checkbox>
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={isSubmitting}
                      style={{
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#1351AA",
                        border: "2px solid #E3E2DE",
                        fontSize: 16,
                        fontWeight: 500
                      }}
                    >
                      {isSubmitting ? t("signup.sign_up_button") + "..." : t("signup.sign_up_button")}
                    </Button>

                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      marginTop: 24, 
                      paddingTop: 20, 
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      fontSize: 14
                    }}>
                      <span style={{ color: "#FFFFFF", marginRight: 8, fontWeight: 500 }}>
                        {t("signup.have_account")}
                      </span>
                      <Link to="/login" style={{ color: "#60A5FA", fontWeight: 500, textDecoration: "none" }}>
                        {t("signup.login_link")}
                      </Link>
                    </div>
                  </Form>
                </div>

                <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                  <button
                    onClick={() => setLanguage("en")}
                    style={{ 
                      color: "#F3F3F1", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      fontSize: 14,
                      fontWeight: 500,
                      padding: 0
                    }}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("es")}
                    style={{ 
                      color: "#F3F3F1", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      fontSize: 14,
                      fontWeight: 500,
                      padding: 0
                    }}
                  >
                    Español
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
}