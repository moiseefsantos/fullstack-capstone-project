import React, { useState } from 'react';
import './RegisterPage.css';
import { urlConfig } from '../../config';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.authtoken) {
            setError('Registration failed: no token returned');
            return;
          }
          
        sessionStorage.setItem('auth-token', data.authtoken);
        sessionStorage.setItem('name', firstName);
        sessionStorage.setItem('email', email);
        navigate('/app');
      } else {
        setError(data.error || 'Registration failed');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Internal server error');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page container mt-5">
      <h2 className="text-center mb-4">Register</h2>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="firstName" className="form-label">First Name</label>
        <input
          id="firstName"
          type="text"
          className="form-control"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="lastName" className="form-label">Last Name</label>
        <input
          id="lastName"
          type="text"
          className="form-control"
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          type="password"
          className="form-control"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary w-100 mb-3"
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
};

export default RegisterPage;