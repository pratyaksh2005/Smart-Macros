import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: any) => {
    console.log('Google Sign-In success:', credentialResponse);
    // TODO: send token to backend or store locally
    navigate('/home');
  };

  const handleError = () => {
    console.error('Google Sign-In failed');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Welcome to Smart Macros</h2>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default Login;