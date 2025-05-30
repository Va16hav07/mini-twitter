import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await fetch('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data._id,
                    username: data.username,
                    email: data.email
                }));
                setMessage('Signin successful!');
                navigate('/');
            } else setMessage(data.error || 'Signin failed');
        } catch (err) {
            console.error('Sign in error:', err);
            setMessage('Signin failed');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h2>Signin</h2>
                {message && <div>{message}</div>}
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                />
                <button type="submit">Signin</button>
            </form>
        </div>
    );
};

export default Signin;
