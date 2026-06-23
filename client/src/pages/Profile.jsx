import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { displayName } from '../utils/format';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, saveProfile, logout } = useApp();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name || '', username: user.username }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile(form);
      setForm((f) => ({ ...f, password: '' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">ACCOUNT</span>
        <h1>Profile</h1>
        <p>Manage your name, username and password.</p>
      </header>

      <div className="profile-card panel-card">
        <div className="profile-avatar">{displayName(user)?.[0]?.toUpperCase()}</div>
        <form className="stack-form profile-form" onSubmit={submit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </label>
          <label>
            Username
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </label>
          <label>
            New password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current"
              minLength={6}
            />
          </label>
          <div className="profile-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button variant="danger" type="button" onClick={logout}>
              Logout
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
