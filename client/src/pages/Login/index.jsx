import React from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/users";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { SetUser } from "../../redux/userSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

// pages/Login/index.jsx
const onFinish = async (values) => {
  try {
    const response = await LoginUser(values);
    if (response.success) {
      message.success(response.message);
      
      // Store both token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redirect based on user role
      switch (response.data.user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "partner":
          navigate("/partner");
          break;
        default:
          navigate("/");
      }
    } else {
      message.error(response.message);
    }
  } catch (err) {
    message.error(err.message);
  }
};


  // Redirect if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "partner":
          navigate("/partner");
          break;
        default:
          navigate("/");
      }
    }
  }, [navigate]);

  return (
    <>
      <main className="App-header">
        <h1>BookMyShow</h1>
        <section className="mw-500 text-center px-3">
          <Form 
            layout="vertical" 
            onFinish={onFinish}
            className="login-form"
          >
            <Form.Item
              label="Email"
              name="email"
              className="d-block"
              rules={[
                { 
                  required: true, 
                  message: "Email is required" 
                },
                { 
                  type: "email", 
                  message: "Please enter a valid email id." 
                }
              ]}
            >
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              className="d-block"
              rules={[
                { 
                  required: true, 
                  message: "Password is required" 
                },
                {
                  min: 5,
                  message: "Password must be at least 5 characters"
                }
              ]}
            >
              <Input.Password
                id="password"
                placeholder="Enter your Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="d-block">
              <Button
                type="primary"
                block
                htmlType="submit"
                style={{ 
                  fontSize: "1rem", 
                  fontWeight: "600" 
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-links">
            <p>
              New User? <Link to="/register">Register Here</Link>
            </p>
            <p>
              Forgot Password? <Link to="/forgot-password">Reset Here</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Login;
