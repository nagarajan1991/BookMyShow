import React from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterUser } from '../../api/users';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';

const { Option } = Select;

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(ShowLoading());
            const response = await RegisterUser(values);
            dispatch(HideLoading());
            if (response.success) {
                message.success(response.message);
                navigate('/login');
            } else {
                message.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    return (
        <div className="flex justify-center h-screen items-center bg-primary">
            <div className="card p-3 w-400">
                <h1 className="text-xl mb-4">Register</h1>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input placeholder="Enter your name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                            { required: true, message: 'Please input your phone number!' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }
                        ]}
                    >
                        <Input placeholder="Enter your phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Please input your address!' }]}
                    >
                        <Input.TextArea placeholder="Enter your address" />
                    </Form.Item>

                    <Form.Item
                        label="Gender"
                        name="gender"
                        rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                        <Select placeholder="Select your gender">
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <div className="flex flex-col mt-2 gap-1">
                        <Button type="primary" htmlType="submit" block>
                            Register
                        </Button>
                        <Link to="/login" className="text-primary">
                            Already have an account? Login
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Register;
