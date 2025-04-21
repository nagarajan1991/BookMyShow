import React from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/users";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { SetUser } from "../../redux/userSlice";
import { UserOutlined, LockOutlined, LinkedinOutlined } from "@ant-design/icons";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Keeping your existing onFinish function exactly as is
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

  // Keeping your existing useEffect exactly as is
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
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <h1 className="brand-title">BookMyShow</h1>
            <p className="brand-tagline">Your Gateway to Entertainment</p>
          </div>

          <Form 
            layout="vertical" 
            onFinish={onFinish}
            className="login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email id." }
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Enter your Email"
                className="custom-input"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 5, message: "Password must be at least 5 characters" }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Enter your Password"
                className="custom-input"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-button"
              >
                Login
              </Button>
            </Form.Item>

            <div className="form-links">
              <Link to="/register" className="register-link">
                New User? Register Here
              </Link>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>
          </Form>

          <div className="creator-info">
            <p>Created by Naga Lakshmanan</p>
            <a
              href="https://www.linkedin.com/in/nagalakshmanan/"
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              <LinkedinOutlined /> Connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
