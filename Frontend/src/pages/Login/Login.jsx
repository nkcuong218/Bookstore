import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Paper 
} from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await fetch("http://localhost:8080/api/auth/login", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ username, password }),
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             localStorage.setItem("token", data.token);
    //             navigate("/dashboard");
    //         }
    //     } catch (error) {
    //         console.error("Login failed:", error);
    //     }
    // };

    // Test without backend
    const handleLogin = (e) => {
        e.preventDefault();

        // Validate input
        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser) {
            alert("Chưa có tài khoản! Vui lòng đăng ký trước.");
            return;
        }

        if (
            username === storedUser.username &&
            password === storedUser.password
        ) {
            localStorage.setItem("token", "fake-token-123");
            localStorage.setItem("currentUser", JSON.stringify({ username: storedUser.username }));
            alert("Đăng nhập thành công!");
            navigate("/");
            // Reload để cập nhật Header
            window.location.reload();
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };
    return (
        <Box sx={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default',
            py: 6
        }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 3, 
                            textAlign: 'center', 
                            color: 'primary.main',
                            fontWeight: 'bold'
                        }}
                    >
                        Đăng Nhập
                    </Typography>
                    
                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth
                            label="Tên đăng nhập"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        
                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large"
                            sx={{ 
                                mt: 1, 
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            Đăng Nhập
                        </Button>
                    </Box>
                    
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mt: 3, 
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}
                    >
                        Chưa có tài khoản?{" "}
                        <Link 
                            to="/register" 
                            style={{ 
                                color: '#e57373', 
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            Đăng ký ngay
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}



export default Login;