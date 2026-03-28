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

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    
    // const handleRegister = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await fetch("http://localhost:8080/api/auth/register", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ username, password, phone, email, confirmPassword }),
    //         });
            
    //         if (response.ok) {
    //             navigate("/login");
    //         }


    //     } catch (error) {
    //         console.error("Registration failed:", error);
    //     }
    // };

    // Test without backend
    const handleRegister = (e) => {
        e.preventDefault();

        // Validate input
        if (!username || !password || !email || !phone || !confirmPassword) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        // Check if user already exists
        const existingUser = localStorage.getItem("user");
        if (existingUser) {
            const existing = JSON.parse(existingUser);
            if (existing.username === username) {
                alert("Tên đăng nhập đã tồn tại!");
                return;
            }
        }

        const user = { username, password, email, phone };

        // Lưu vào localStorage
        localStorage.setItem("user", JSON.stringify(user));

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
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
                        Đăng Ký
                    </Typography>
                    
                    <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            type="tel"
                            variant="outlined"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
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
                        
                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu"
                            type="password"
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Đăng Ký
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
                        Đã có tài khoản?{" "}
                        <Link 
                            to="/login" 
                            style={{ 
                                color: '#e57373', 
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            Đăng nhập ngay
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default  Register;