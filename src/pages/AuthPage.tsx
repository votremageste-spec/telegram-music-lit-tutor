import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthPageProps {
  onAuthSuccess: (firebaseUser: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getReadableError = (error: any) => {
    const code = error?.code || '';

    if (code.includes('auth/email-already-in-use')) {
      return 'Такой email уже зарегистрирован. Попробуйте войти.';
    }

    if (code.includes('auth/invalid-email')) {
      return 'Введите корректный email.';
    }

    if (code.includes('auth/weak-password')) {
      return 'Пароль слишком простой. Минимум 6 символов.';
    }

    if (code.includes('auth/invalid-credential')) {
      return 'Неверный email или пароль.';
    }

    if (code.includes('auth/user-not-found')) {
      return 'Пользователь с таким email не найден.';
    }

    if (code.includes('auth/wrong-password')) {
      return 'Неверный пароль.';
    }

    return 'Не удалось выполнить вход. Проверьте данные и попробуйте ещё раз.';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Введите email.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Пароль должен быть не короче 6 символов.');
      return;
    }

    if (!isLoginMode && !name.trim()) {
      setErrorMessage('Введите имя ученика.');
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        const result = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        onAuthSuccess(result.user);
        return;
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim(),
      });

      onAuthSuccess(result.user);
    } catch (error) {
      setErrorMessage(getReadableError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎵 МУЗЛИТ-РЕПЕТИТОР</h1>

        <p className="auth-subtitle">
          {isLoginMode
            ? 'Войдите, чтобы продолжить подготовку'
            : 'Создайте аккаунт для сохранения прогресса'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <label>
              Имя ученика
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например, Олег"
              />
            </label>
          )}

          <label>
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
            />
          </label>

          <label>
            Пароль
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
            />
          </label>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading
              ? 'Пожалуйста, подождите...'
              : isLoginMode
                ? 'Войти'
                : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          className="auth-switch-button"
          type="button"
          onClick={() => {
            setIsLoginMode((current) => !current);
            setErrorMessage('');
          }}
        >
          {isLoginMode
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </button>

        <p className="auth-note">
          Этот вход нужен для пользователей, которые открывают приложение без
          Telegram.
        </p>
      </div>
    </div>
  );
};
