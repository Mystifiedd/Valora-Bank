import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/format';
import LoginCard from '../../components/auth/LoginCard';
import HomeHomepage from '../../components/homepage/HomeHomepage';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      const dest =
        userData.role === 'Admin'
          ? '/admin'
          : userData.role === 'Employee'
          ? '/employee'
          : '/customer';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeHomepage>
      <LoginCard
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
        registerLink={<Link to="/register">Create one</Link>}
      />
    </HomeHomepage>
  );
}
