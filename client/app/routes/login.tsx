import { useForm } from "react-hook-form";
import { Button, Form, Input, Card } from "antd";
import { useAuth, type LoginDTO } from "../contexts/AuthContext.tsx";
import { useNavigate } from "react-router";



export default function LoginRoute() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginDTO>();

  const onSubmit = async (data: LoginDTO) => {
    await login(data);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Email">
            <Input {...register("email")} />
          </Form.Item>

          <Form.Item label="Password">
            <Input.Password {...register("password")} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
