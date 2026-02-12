import { useForm, Controller } from "react-hook-form";
import { Button, Form, Input, Layout, Alert, Grid, Typography, theme } from "antd";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Content } = Layout;

// Usar import para imágenes locales
const logoImage = "/assets/Logotipo 1.png";
const backgroundImage = "/assets/landscapeB.jpg";

interface ConfirmationCodeDTO {
  digit0: string;
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  digit5: string;
}

export default function ConfirmAccountRoute() {
  const { token } = useToken();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Control de mounting para SSR/SSG
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Breakpoints explícitos para control granular
  const isMobile = isMounted && !screens.sm;
  const isTablet = isMounted && screens.sm && !screens.lg;
  const isDesktop = isMounted && screens.lg;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<ConfirmationCodeDTO>({
    mode: "onChange",
    defaultValues: {
      digit0: "",
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
    },
  });

  const onSubmit = async (data: ConfirmationCodeDTO) => {
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      // Construir el código completo
      const code = Object.values(data).join("");
      
      // Aquí iría la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular error para demostración
      if (code !== "123456") {
        throw new Error("Código inválido");
      }
      
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(t("errors.invalid_code") || "Código inválido. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de input para auto-focus
  const handleInputChange = (
    value: string,
    fieldName: keyof ConfirmationCodeDTO,
    onChange: (value: string) => void
  ) => {
    onChange(value);
    
    // Solo permitir un dígito
    if (value.length > 1) {
      onChange(value.charAt(0));
    }
    
    // Mover al siguiente input si se ingresó un dígito
    if (value.length === 1) {
      const fields: (keyof ConfirmationCodeDTO)[] = ["digit0", "digit1", "digit2", "digit3", "digit4", "digit5"];
      const currentIndex = fields.indexOf(fieldName);
      
      if (currentIndex < fields.length - 1) {
        setFocus(fields[currentIndex + 1]);
      }
    }
  };

  // Skeleton durante SSR
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
        {/* Contenedor principal con comportamiento responsive explícito */}
        <div className={`
          relative min-h-screen w-full
          ${isMobile 
            ? "bg-gradient-to-br from-blue-50 to-purple-50" 
            : "bg-gradient-to-br from-gray-900 to-gray-800"
          }
        `}>
          {/* Background image para desktop/tablet */}
          {!isMobile && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          )}

          {/* Overlay para desktop/tablet */}
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70" />
          )}

          {/* Contenido principal */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            {isMobile ? (
              // 📱 MOBILE: Card simple centrada ocupando viewport
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  {/* Logo */}
                  <div className="text-center mb-8">
                    <img 
                      src={logoImage} 
                      alt="Logo" 
                      className="w-40 h-auto mx-auto mb-6"
                    />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("confirm.title") || "Confirmar correo"}
                    </h1>
                    <p className="text-gray-600 text-center mb-4">
                      {t("confirm.message") || "Le enviamos un código a su correo para asegurar su dirección"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("confirm.expires") || "Expira en 10 minutos"}
                    </p>
                  </div>
                  
                  <Form
                    layout="vertical"
                    onFinish={handleSubmit(onSubmit)}
                    autoComplete="off"
                    size="large"
                  >
                    {submitError && (
                      <Alert
                        type="error"
                        message={submitError}
                        showIcon
                        closable
                        onClose={() => setSubmitError(null)}
                        className="mb-6"
                      />
                    )}

                    {/* Código de 6 dígitos */}
                    <div className="mb-8">
                      <div className="flex justify-center gap-3 mb-4">
                        {["digit0", "digit1", "digit2", "digit3", "digit4", "digit5"].map((fieldName, index) => (
                          <div key={fieldName} className="w-14 h-14">
                            <Controller
                              name={fieldName as keyof ConfirmationCodeDTO}
                              control={control}
                              rules={{
                                required: " ",
                                pattern: {
                                  value: /^[0-9]$/,
                                  message: " ",
                                },
                              }}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  className={`w-full h-full text-center text-2xl font-bold rounded-xl ${
                                    errors[fieldName as keyof ConfirmationCodeDTO] 
                                      ? "border-red-500" 
                                      : "border-gray-300"
                                  }`}
                                  onChange={(e) => handleInputChange(
                                    e.target.value,
                                    fieldName as keyof ConfirmationCodeDTO,
                                    field.onChange
                                  )}
                                  disabled={isSubmitting}
                                />
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Mensaje de error combinado */}
                      {Object.keys(errors).length > 0 && (
                        <p className="text-center text-red-500 text-sm mt-2">
                          {t("errors.code_required") || "Por favor, ingrese los 6 dígitos"}
                        </p>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4">
                      <Button
                        type="default"
                        size="large"
                        block
                        className="h-12 rounded-xl"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                      >
                        {t("confirm.cancel") || "Cancelar"}
                      </Button>
                      
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={isSubmitting}
                        className="h-12 rounded-xl"
                      >
                        {isSubmitting 
                          ? (t("confirm.sending") || "Enviando...") 
                          : (t("confirm.submit") || "Enviar")
                        }
                      </Button>
                    </div>

                    {/* Reenviar código */}
                    <div className="text-center mt-8 pt-6 border-t">
                      <span className="text-gray-600">
                        {t("confirm.no_code") || "¿No recibió el código?"}{" "}
                      </span>
                      <button 
                        type="button"
                        className="text-blue-600 font-medium hover:text-blue-800 disabled:text-gray-400"
                        disabled={isSubmitting}
                      >
                        {t("confirm.resend") || "Reenviar"}
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            ) : (
              // 💻 DESKTOP/TABLET: Layout centrado con fondo
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Columna izquierda - Logo y título */}
                  <div className="text-center lg:text-left">
                    <img 
                      src={logoImage} 
                      alt="Logo" 
                      className="w-full max-w-sm mx-auto lg:mx-0 mb-8"
                    />
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                      {t("confirm.title") || "Confirmar correo"}
                    </h1>
                    <p className="text-xl text-gray-300">
                      {t("confirm.welcome") || "Verifique su identidad para continuar"}
                    </p>
                  </div>

                  {/* Columna derecha - Formulario */}
                  <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
                    <Form
                      layout="vertical"
                      onFinish={handleSubmit(onSubmit)}
                      autoComplete="off"
                      size="large"
                    >
                      {submitError && (
                        <Alert
                          type="error"
                          message={submitError}
                          showIcon
                          closable
                          onClose={() => setSubmitError(null)}
                          className="mb-8"
                        />
                      )}

                      {/* Mensaje */}
                      <div className="mb-10">
                        <p className="text-white text-lg mb-4">
                          {t("confirm.message") || "Le enviamos un código a su correo para asegurar su dirección"}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {t("confirm.expires") || "Por favor, inserte el código enviado a su correo. Expira en 10 minutos"}
                        </p>
                      </div>

                      {/* Código de 6 dígitos */}
                      <div className="mb-12">
                        <div className="flex justify-center gap-4 mb-6">
                          {["digit0", "digit1", "digit2", "digit3", "digit4", "digit5"].map((fieldName, index) => (
                            <div key={fieldName} className="w-16 h-16">
                              <Controller
                                name={fieldName as keyof ConfirmationCodeDTO}
                                control={control}
                                rules={{
                                  required: " ",
                                  pattern: {
                                    value: /^[0-9]$/,
                                    message: " ",
                                  },
                                }}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className={`w-full h-full text-center text-3xl font-bold rounded-xl bg-white/10 border-2 ${
                                      errors[fieldName as keyof ConfirmationCodeDTO] 
                                        ? "border-red-500 text-red-500" 
                                        : "border-white/20 text-white"
                                    }`}
                                    onChange={(e) => handleInputChange(
                                      e.target.value,
                                      fieldName as keyof ConfirmationCodeDTO,
                                      field.onChange
                                    )}
                                    disabled={isSubmitting}
                                  />
                                )}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Mensaje de error combinado */}
                        {Object.keys(errors).length > 0 && (
                          <p className="text-center text-red-300 text-sm mt-2">
                            {t("errors.code_required") || "Por favor, ingrese los 6 dígitos"}
                          </p>
                        )}
                      </div>

                      {/* Botones */}
                      <div className="flex gap-6">
                        <Button
                          type="default"
                          size="large"
                          block
                          className="h-14 text-lg rounded-xl border-white/20 text-white bg-transparent hover:bg-white/10"
                          onClick={() => navigate(-1)}
                          disabled={isSubmitting}
                        >
                          {t("confirm.cancel") || "Cancelar"}
                        </Button>
                        
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          loading={isSubmitting}
                          className="h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 border-white/20"
                        >
                          {isSubmitting 
                            ? (t("confirm.sending") || "Enviando...") 
                            : (t("confirm.submit") || "Enviar")
                          }
                        </Button>
                      </div>

                      {/* Reenviar código */}
                      <div className="text-center mt-10 pt-8 border-t border-white/20">
                        <span className="text-white text-lg">
                          {t("confirm.no_code") || "¿No recibió el código?"}{" "}
                        </span>
                        <button 
                          type="button"
                          className="text-blue-300 font-medium hover:text-blue-200 text-lg disabled:text-gray-400"
                          disabled={isSubmitting}
                        >
                          {t("confirm.resend") || "Reenviar código"}
                        </button>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
} 