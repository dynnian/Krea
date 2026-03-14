import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Layout,
  Alert,
  Checkbox,
  Grid,
  Typography,
  theme,
} from "antd";
import { useAuth, type LoginDTO } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useI18n } from "../contexts/I18nContext";
import axios from 'axios';

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Content } = Layout;

const logoImage = "/assets/Logotipo 1.png";
const backgroundImage = "/assets/landscape.jpg";

export default function LoginRoute() {
  const { login,user } = useAuth();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLanguage } = useI18n();
  
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === "Admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  const isMobile = isMounted && !screens.sm;

  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ emailOrUsername: string; password: string }>({
    mode: "onBlur",
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: { emailOrUsername: string; password: string }) => {
    setAuthError(null);
    try {
      // Map form data to the expected LoginDTO (email field)
      await login({ email: data.emailOrUsername, password: data.password }, rememberMe);
      // navigate("/", { replace: true });
    } catch (error) {
      // Set error message in local state, do NOT rethrow
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        const message =
          responseData?.message ||
          responseData?.title ||
          (responseData?.errors ? Object.values(responseData.errors).flat().join(' ') : null) ||
          t('errors.auth_failed');
        setAuthError(message);
      } else {
        setAuthError(t('errors.network_error'));
      }
    }
  };

  if (!isMounted) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content className="flex items-center justify-center p-4">
          <div className="w-full max-w-md animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-8"></div>
            <div className="h-14 bg-gray-300 rounded"></div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content>
        <div className={`
          relative min-h-screen w-full
          ${isMobile 
            ? "bg-gradient-to-br from-blue-50 to-purple-50 p-4" 
            : "bg-gradient-to-br from-gray-900 to-gray-800"
          }
        `}>
          {!isMobile && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70" />
            </>
          )}

          <div className="relative z-10 flex items-center justify-center min-h-screen">
            {isMobile ? (
              // Mobile view
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="text-center mb-8">
                    <img src={logoImage} alt="Logo" className="w-48 h-auto mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("login.title")}
                    </h1>
                    <p className="text-gray-600">{t("login.welcome")}</p>
                  </div>

                  <Form layout="vertical" onFinish={handleSubmit(onSubmit)} autoComplete="off" size="large">
                    {authError && (
                      <Alert
                        type="error"
                        message={authError}
                        showIcon
                        closable
                        onClose={() => setAuthError(null)}
                        className="mb-6"
                      />
                    )}

                    <Form.Item
                      label={t("login.email_placeholder")}
                      validateStatus={errors.emailOrUsername ? "error" : ""}
                      help={errors.emailOrUsername?.message}
                      required
                      className="mb-6"
                    >
                      <Controller
                        name="emailOrUsername"
                        control={control}
                        rules={{
                          required: t("errors.email_required"),
                          // Removed pattern validation to allow username
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t("login.email_placeholder")}
                            className="text-base rounded-xl"
                            disabled={isSubmitting}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label={t("login.password_placeholder")}
                      validateStatus={errors.password ? "error" : ""}
                      help={errors.password?.message}
                      required
                      className="mb-6"
                    >
                      <Controller
                        name="password"
                        control={control}
                        rules={{
                          required: t("errors.password_required"),
                          minLength: {
                            value: 6,
                            message: t("errors.password_min_length"),
                          },
                        }}
                        render={({ field }) => (
                          <Input.Password
                            {...field}
                            placeholder={t("login.password_placeholder")}
                            className="text-base rounded-xl"
                            disabled={isSubmitting}
                          />
                        )}
                      />
                    </Form.Item>

                    <div className="flex items-center justify-between mb-8">
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      >
                        <span className="text-gray-700">{t("login.remember_me")}</span> {/* Changed to dark text */}
                      </Checkbox>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                        {t("login.forgot_password")}
                      </a>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={isSubmitting}
                      className="h-14 text-lg rounded-2xl"
                    >
                      {isSubmitting ? t("login.sign_in_button") + "..." : t("login.sign_in_button")}
                    </Button>

                    <div className="text-center mt-8 pt-6 border-t">
                      <span className="text-gray-600">{t("login.no_account")} </span>
                      <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-800">
                        {t("login.register")}
                      </Link>
                    </div>
                  </Form>
                </div>
              </div>
            ) : (
              // Desktop/Tablet view (unchanged except for error handling and mapping)
              <div className="w-full max-w-6xl mx-auto p-4">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="text-center lg:text-left">
                    <img src={logoImage} alt="Logo" className="w-full max-w-md mx-auto lg:mx-0 mb-8" />
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t("login.title")}</h1>
                    <p className="text-xl text-gray-300">{t("login.welcome")}</p>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
                    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} autoComplete="off" size="large">
                      {authError && (
                        <Alert
                          type="error"
                          message={authError}
                          showIcon
                          closable
                          onClose={() => setAuthError(null)}
                          className="mb-8"
                        />
                      )}

                      <Form.Item
                        label={<span className="text-white text-lg">{t("login.email_placeholder")}</span>}
                        validateStatus={errors.emailOrUsername ? "error" : ""}
                        help={
                          errors.emailOrUsername && (
                            <span className="text-red-300">{errors.emailOrUsername.message}</span>
                          )
                        }
                        required
                        className="mb-8"
                      >
                        <Controller
                          name="emailOrUsername"
                          control={control}
                          rules={{
                            required: t("errors.email_required"),
                            // No pattern
                          }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder={t("login.email_placeholder")}
                              className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl"
                              disabled={isSubmitting}
                            />
                          )}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-white text-lg">{t("login.password_placeholder")}</span>}
                        validateStatus={errors.password ? "error" : ""}
                        help={
                          errors.password && (
                            <span className="text-red-300">{errors.password.message}</span>
                          )
                        }
                        required
                        className="mb-8"
                      >
                        <Controller
                          name="password"
                          control={control}
                          rules={{
                            required: t("errors.password_required"),
                            minLength: {
                              value: 6,
                              message: t("errors.password_min_length"),
                            },
                          }}
                          render={({ field }) => (
                            <Input.Password
                              {...field}
                              placeholder={t("login.password_placeholder")}
                              className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl"
                              disabled={isSubmitting}
                            />
                          )}
                        />
                      </Form.Item>

                      <div className="flex items-center mb-10">
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="text-white text-lg"
                        >
                          {t("login.remember_me")}
                        </Checkbox>
                      </div>

                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={isSubmitting}
                        className="h-14 text-xl bg-blue-600 hover:bg-blue-700 border-white/20 rounded-2xl"
                      >
                        {isSubmitting ? t("login.sign_in_button") + "..." : t("login.sign_in_button")}
                      </Button>

                      <div className="text-center mt-10 pt-8 border-t border-white/20">
                        <span className="text-white text-lg">{t("login.no_account")} </span>
                        <Link to="/signup" className="text-blue-300 font-medium hover:text-blue-200 text-lg">
                          {t("login.register")}
                        </Link>
                      </div>
                    </Form>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-12">
                  <button onClick={() => setLanguage("en")} className="text-white hover:text-blue-300 text-lg transition-colors">
                    English
                  </button>
                  <button onClick={() => setLanguage("es")} className="text-white hover:text-blue-300 text-lg transition-colors">
                    Español
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}