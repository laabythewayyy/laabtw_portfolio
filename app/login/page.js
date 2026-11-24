import LoginForm from './LoginForm';
import LoginStrike from './LoginStrike';
import '../admin/admin.css';

export const metadata = { title: 'Sign in · Tola Sann', robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="login">
      <LoginStrike targetId="login-title" />
      <div className="login-card">
        <h1 id="login-title">
          TOLA <span className="surname">SANN</span>
        </h1>
        <p className="login-sub">Sign in to edit your website.</p>
        <LoginForm />
      </div>
    </main>
  );
}
