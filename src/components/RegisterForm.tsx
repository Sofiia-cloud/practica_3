import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../modules/Register.module.css';
import { FirebaseError } from 'firebase/app';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Эта почта уже используется. Попробуйте войти или использовать другую почту';
      case 'auth/invalid-email':
        return 'Неверный формат email адреса';
      case 'auth/weak-password':
        return 'Пароль слишком слабый. Используйте не менее 6 символов';
      case 'auth/operation-not-allowed':
        return 'Регистрация с email/password временно отключена';
      case 'auth/network-request-failed':
        return 'Ошибка сети. Проверьте подключение к интернету';
      default:
        return 'Произошла неизвестная ошибка. Попробуйте еще раз';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
      navigate('/');
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err));
      } else {
        setError('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={styles.form_container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.form_content}>
          <div className={styles.form_header}>
            <h1>Регистрация</h1>
          </div>

          {error && <div className={styles.error_message}>{error}</div>}

          <div className={styles.block_input}>
            <label>
              <input
                name="displayName"
                type="text"
                placeholder="Имя пользователя"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <input
                name="password"
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className={styles.buttons_line}>
            <Link to="/login" className={styles.grey_button}>
              Войти
            </Link>
            <button
              type="submit"
              className={styles.yellow_button}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
