import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Layout,
  Alert,
  Checkbox,
  Grid,
  Avatar,
} from "antd";
import { Link, useNavigate } from "react-router";
import { useState, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useI18n } from "../contexts/I18nContext";
import { useAuth, type RegisterDTO } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import axiosClient from "../lib/axios";
import "../components/styles/signUpRouteFieldoverride.css";
import backgroundImage from "../../assets/landscapeB.jpg";
import BrandLogo from "../components/BrandLogo";

const { useBreakpoint } = Grid;
const { Content } = Layout;

interface SignUpDTO {
  username: string;
  displayName: string;
  biography: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Strong password: min 8, uppercase, lowercase, number, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function SignUpRoute() {
  const { isAuthenticated, register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = useI18n();

  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;

  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!profilePictureFile) {
      setProfilePicturePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(profilePictureFile);
    setProfilePicturePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [profilePictureFile]);

const {
  control,
  handleSubmit,
  watch,
  setError,
  formState: { errors, isSubmitting },
} = useForm<SignUpDTO>({
  mode: "onBlur",
  defaultValues: {
    username: "",
    displayName: "",
    biography: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});

  const password = watch("password");

  const usernameRules = {
    required: t("errors.username_required"),
    validate: (value: string) => !!value.trim() || t("errors.username_empty"),
  };

  const displayNameRules = {
    required: t("errors.display_name_required"),
    validate: (value: string) => !!value.trim() || t("errors.display_name_empty"),
    maxLength: {
      value: 32,
      message: t("errors.display_name_max_length"),
    },
  };

  const biographyRules = {
    maxLength: {
      value: 256,
      message: t("errors.biography_max_length"),
    },
  };

  const emailRules = {
    required: t("errors.email_required"),
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: t("errors.invalid_email"),
    },
  };

  const passwordRules = {
    required: t("errors.password_required"),
    minLength: {
      value: 8,
      message: t("errors.password_min_length"),
    },
    pattern: {
      value: PASSWORD_REGEX,
      message: t("errors.password_complexity"),
    },
  };

  const confirmPasswordRules = {
    required: t("errors.confirm_password_required"),
    validate: (value: string) => value === password || t("errors.passwords_do_not_match"),
  };

  const handleImageSelection = (
    event: ChangeEvent<HTMLInputElement>,
    pictureType: "profile"
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      if (pictureType === "profile") {
        setProfilePictureFile(null);
      }
      return;
    }

    if (!IMAGE_MIME_TYPES.includes(selectedFile.type)) {
      setAuthError(t("errors.image_invalid_type"));
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setAuthError(t("errors.image_too_large"));
      event.target.value = "";
      return;
    }

    setAuthError(null);

    if (pictureType === "profile") {
      setProfilePictureFile(selectedFile);
    }
  };

  const uploadImageAndGetMediaId = async (token: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<{ mediaId: string }>(
      "/users/me/profile-picture",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.mediaId;
  };

  const patchProfilePicture = async (token: string, profilePictureId: string): Promise<void> => {
    if (!profilePictureId) {
      return;
    }

    await axiosClient.patch("/users/me/profile", { profilePictureId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const onSubmit = async (data: SignUpDTO) => {
    setAuthError(null);

    const trimmedData = {
      username: data.username.trim(),
      displayName: data.displayName.trim(),
      biography: data.biography.trim(),
      email: data.email.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    if (!trimmedData.username || !trimmedData.displayName || !trimmedData.email) {
      setAuthError(t("errors.field_required"));
      return;
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      setAuthError(t("errors.passwords_do_not_match"));
      return;
    }

    if (!PASSWORD_REGEX.test(trimmedData.password)) {
      setAuthError(t("errors.password_complexity"));
      return;
    }

    try {
      const registerData: RegisterDTO = {
        username: trimmedData.username,
        email: trimmedData.email,
        password: trimmedData.password,
        displayName: trimmedData.displayName,
        languageCode: (language || "en").slice(0, 2),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        biography: trimmedData.biography || null,
      };

      const registerResponse = await register(registerData, rememberMe);
      let registrationNotice: string | undefined;
      const registrationToken = registerResponse.token || (registerResponse as any).Token;

      if (profilePictureFile) {
        if (!registrationToken) {
          registrationNotice = t("signup.picture_upload_warning");
        } else {
          try {
            const profilePictureId = await uploadImageAndGetMediaId(registrationToken, profilePictureFile);
            await patchProfilePicture(registrationToken, profilePictureId);
          } catch {
            registrationNotice = t("signup.picture_upload_warning");
          }
        }
      }

      navigate("/login", {
        replace: true,
        state: {
          email: trimmedData.email,
          registrationNotice,
        },
      });
  } catch (error: any) {
    const rawMessage = String(error?.message || "");
    const msg = rawMessage.toLowerCase().trim();

    if (msg.includes("username already taken")) {
      setError("username", {
        type: "server",
        message: t("errors.username_taken"),
      });
      setAuthError(t("errors.username_taken"));
    } else if (msg.includes("email already registered")) {
      setError("email", {
        type: "server",
        message: t("errors.email_taken"),
      });
      setAuthError(t("errors.email_taken"));
    } else {
      setAuthError(rawMessage || t("errors.registration_failed"));
    }
  }

  if (authLoading || !isMounted) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ height: 100, backgroundColor: "#f0f0f0", borderRadius: 12, marginBottom: 24 }} />
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ height: 40, backgroundColor: "#f0f0f0", borderRadius: 8, marginBottom: 12 }} />
            ))}
            <div style={{ height: 44, backgroundColor: "#e0e0e0", borderRadius: 22, marginTop: 16 }} />
          </div>
        </Content>
      </Layout>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const formFields: Array<{
    name: "username" | "displayName" | "biography" | "email" | "password" | "confirmPassword";
    placeholder: string;
    type: "text" | "password" | "textarea";
    rules: Record<string, unknown>;
  }> = [
    { name: "username", placeholder: t("signup.username"), type: "text", rules: usernameRules },
    { name: "displayName", placeholder: t("signup.display_name"), type: "text", rules: displayNameRules },
    { name: "biography", placeholder: t("signup.biography"), type: "textarea", rules: biographyRules },
    { name: "email", placeholder: t("signup.email"), type: "text", rules: emailRules },
    { name: "password", placeholder: t("signup.password"), type: "password", rules: passwordRules },
    {
      name: "confirmPassword",
      placeholder: t("signup.confirmPassword"),
      type: "password",
      rules: confirmPasswordRules,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isMobile ? (
          <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
            <div style={{ width: "100%", backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <BrandLogo ariaLabel="Logo" color="#1351AA" width={100} className="mb-4" />
                <h2 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 500 }}>{t("signup.title")}</h2>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{t("signup.welcome")}</p>
              </div>
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {authError && <Alert type="error" message={authError} closable onClose={() => setAuthError(null)} style={{ marginBottom: 16 }} />}
                {formFields.map((field) => (
                  <Form.Item key={field.name} validateStatus={errors[field.name] ? "error" : ""} help={errors[field.name]?.message as string | undefined} style={{ marginBottom: 12 }}>
                    <Controller
                      name={field.name}
                      control={control}
                      rules={field.rules}
                      render={({ field: controllerField }) => {
                        if (field.type === "password") {
                          return (
                            <Input.Password
                              {...controllerField}
                              placeholder={field.placeholder}
                              size="middle"
                              style={{ height: 40, borderRadius: 8, fontSize: 14 }}
                            />
                          );
                        }

                        if (field.type === "textarea") {
                          return (
                            <Input.TextArea
                              {...controllerField}
                              placeholder={field.placeholder}
                              autoSize={{ minRows: 3, maxRows: 5 }}
                              style={{ borderRadius: 8, fontSize: 14 }}
                            />
                          );
                        }

                        return (
                          <Input
                            {...controllerField}
                            placeholder={field.placeholder}
                            size="middle"
                            style={{ height: 40, borderRadius: 8, fontSize: 14 }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                ))}

                <Form.Item style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 6, color: "#333", fontSize: 13, fontWeight: 500 }}>{t("signup.profile_picture")}</div>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => handleImageSelection(event, "profile")}
                    style={{ height: "auto", padding: 8, borderRadius: 8 }}
                  />
                  {profilePicturePreview && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar src={profilePicturePreview} size={48} />
                      <span style={{ color: "#666", fontSize: 12 }}>{t("signup.profile_picture_preview")}</span>
                    </div>
                  )}
                  {profilePictureFile && (
                    <div style={{ marginTop: 6, color: "#666", fontSize: 12 }}>{profilePictureFile.name}</div>
                  )}
                </Form.Item>

                <Form.Item style={{ marginBottom: 20 }}>
                  <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ fontSize: 14 }}>{t("signup.remember_me")}</Checkbox>
                </Form.Item>
                <Button type="primary" htmlType="submit" size="middle" block loading={isSubmitting} style={{ height: 44, borderRadius: 22, fontSize: 14 }}>
                  {isSubmitting ? t("signup.sign_up_button") + "..." : t("signup.sign_up_button")}
                </Button>
                <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0", fontSize: 14 }}>
                  <span style={{ color: "#666", marginRight: 8 }}>{t("signup.have_account")}</span>
                  <Link to="/login" style={{ color: "#1890ff", textDecoration: "none" }}>{t("signup.login_link")}</Link>
                </div>
              </Form>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 24px",
              backgroundImage: `linear-gradient(46deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.55) 100%), url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(27, 28, 30, 0.30)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                padding: 40,
                maxWidth: 520,
                width: "100%",
                maxHeight: "calc(100vh - 64px)",
                overflowY: "auto",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <BrandLogo ariaLabel="Logo" color="#F3F3F1" width={200} />
                <h1 style={{ color: "#F3F3F1", textAlign: "center", margin: 0, fontSize: 20, fontWeight: 500 }}>{t("signup.welcome")}</h1>
                <div style={{ width: "100%" }}>
                  <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    {authError && <Alert type="error" message={authError} closable onClose={() => setAuthError(null)} style={{ marginBottom: 20 }} />}
                    {formFields.map((field) => (
                      <Form.Item key={field.name} validateStatus={errors[field.name] ? "error" : ""} help={errors[field.name]?.message as string | undefined} style={{ marginBottom: 16 }}>
                        <Controller
                          name={field.name}
                          control={control}
                          rules={field.rules}
                          render={({ field: controllerField }) => {
                            if (field.type === "password") {
                              return (
                                <Input.Password
                                  {...controllerField}
                                  placeholder={field.placeholder}
                                  size="large"
                                  style={{
                                    height: 44,
                                    backgroundColor: "#E8E8E8",
                                    border: "2px solid #1B1C1E",
                                    borderRadius: 12,
                                    color: "#8F8E8A",
                                    fontSize: 14,
                                    padding: "0 16px",
                                  }}
                                />
                              );
                            }

                            if (field.type === "textarea") {
                              return (
                                <Input.TextArea
                                  {...controllerField}
                                  placeholder={field.placeholder}
                                  autoSize={{ minRows: 3, maxRows: 5 }}
                                  style={{
                                    backgroundColor: "#E8E8E8",
                                    border: "2px solid #1B1C1E",
                                    borderRadius: 12,
                                    color: "#8F8E8A",
                                    fontSize: 14,
                                    padding: "8px 16px",
                                  }}
                                />
                              );
                            }

                            return (
                              <Input
                                {...controllerField}
                                placeholder={field.placeholder}
                                size="large"
                                style={{
                                  height: 44,
                                  backgroundColor: "#E8E8E8",
                                  border: "2px solid #1B1C1E",
                                  borderRadius: 12,
                                  color: "#8F8E8A",
                                  fontSize: 14,
                                  padding: "0 16px",
                                }}
                              />
                            );
                          }}
                        />
                      </Form.Item>
                    ))}

                    <Form.Item style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8, color: "#E8E8E8", fontWeight: 500, fontSize: 14 }}>{t("signup.profile_picture")}</div>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => handleImageSelection(event, "profile")}
                        style={{
                          height: "auto",
                          backgroundColor: "#E8E8E8",
                          border: "2px solid #1B1C1E",
                          borderRadius: 12,
                          color: "#8F8E8A",
                          fontSize: 14,
                          padding: 8,
                        }}
                      />
                      {profilePicturePreview && (
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar src={profilePicturePreview} size={56} />
                          <span style={{ color: "#E8E8E8", fontSize: 12 }}>{t("signup.profile_picture_preview")}</span>
                        </div>
                      )}
                      {profilePictureFile && (
                        <div style={{ marginTop: 8, color: "#E8E8E8", fontSize: 12 }}>{profilePictureFile.name}</div>
                      )}
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 24 }}>
                      <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ color: "#F3F3F1", fontSize: 14, fontWeight: 500 }}>
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
                        fontWeight: 500,
                      }}
                    >
                      {isSubmitting ? t("signup.sign_up_button") + "..." : t("signup.sign_up_button")}
                    </Button>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: 14 }}>
                      <span style={{ color: "#E8E8E8", marginRight: 8, fontWeight: 500 }}>{t("signup.have_account")}</span>
                      <Link to="/login" style={{ color: "#60A5FA", fontWeight: 500, textDecoration: "none" }}>{t("signup.login_link")}</Link>
                    </div>
                  </Form>
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                  <button onClick={() => setLanguage("en")} style={{ color: "#F3F3F1", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, padding: 0 }}>English</button>
                  <button onClick={() => setLanguage("es")} style={{ color: "#F3F3F1", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, padding: 0 }}>Español</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
  }
}
