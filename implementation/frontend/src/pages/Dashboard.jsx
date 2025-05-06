// src/pages/Dashboard.jsx
// This component fetches and displays user accounts and allows account creation, transfer, and bill payments.
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import api from '../api';
import Viewport from '@/components/Viewport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  // State variables for accounts, error messages, editing state, and nickname draft.
  const [accounts, setAccounts] = useState(null);
  const [err, setErr] = useState(null);
  const [editingId, setEditingId] = useState(null); // id of account being edited
  const [draft, setDraft] = useState(''); // nickname draft

  // Hook for navigation
  const nav = useNavigate();

  // ────────────────────────────────────────────────────────────────────
  // Fetch accounts on component mount
  useEffect(() => {
    api
      .get('/accounts')
      .then((r) => setAccounts(r.data))
      .catch((e) => setErr(e.response?.data?.error || e.message));
  }, []);

  // Function to create a new checking account
  async function createChecking() {
    const { data } = await api.post('/accounts', { accountType: 'Checking' });
    setAccounts([...(accounts ?? []), data]);
  }

  // Function to log out the current user
  async function logout() {
    await api.post('/logout');
    window.location = '/login';
  }

  // Function to save the nickname to the backend
  async function saveNickname(id) {
    const name = draft.trim().slice(0, 40); // Limit nickname length to 40 characters.
    try {
      const { data } = await api.patch(`/accounts/${id}`, { nickname: name || null });
      // Update account info in state after successful update
      setAccounts((accs) => accs.map((a) => (a.id === id ? data : a)));
    } catch (e) {
      // soft‑fail: log error, UI remains unchanged.
      console.error(e);
    } finally {
      setEditingId(null); // End editing mode
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Render loading state if accounts haven't been fetched and there's no error
  if (!accounts && !err) return <Viewport>Loading…</Viewport>;

  // Render error message if fetching accounts failed
  if (err)
    return (
      <Viewport>
        <p className="text-red-600">{err}</p>
      </Viewport>
    );

  return (
    <Viewport>
      <div className="mx-auto w-full max-w-4xl space-y-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            {/* Display PiggyBank icon and app name */}
            <PiggyBank className="h-9 w-9 text-piggy-brand" />
            <span className="text-2xl font-bold tracking-wide text-text-primary">PIGGY&nbsp;BANK</span>
          </div>
          {/* Log out button */}
          <Button onClick={logout} className="bg-surface/60 hover:bg-surface rounded-snout px-6 py-2 text-sm shadow-snout">
            Log out
          </Button>
        </div>

        {/* Main title */}
        <h2 className="text-5xl font-semibold text-piggy-brand">Your accounts</h2>

        {/* Accounts table */}
        <div className="overflow-hidden rounded-snout bg-surface/60 backdrop-blur shadow-snout">
          {accounts.length ? (
            <table className="w-full text-lg">
              <thead className="bg-surface/70 text-left text-piggy-brand-dark">
                <tr>
                  <th className="py-4 px-6 font-medium">Name / Type</th>
                  <th className="py-4 px-6 font-medium">Account Number</th>
                  <th className="py-4 px-6 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => {
                  // Determine the display name: nickname takes precedence over the account type.
                  const displayName = a.nickname || a.accountType;
                  const isEditing = editingId === a.id;
                  return (
                    <tr
                      key={a.id}
                      className={`border-t border-border/40 ${
                        a.closedAt ? 'opacity-40 line-through' : 'cursor-pointer hover:bg-background/40'
                      }`}
                      onClick={() => !a.closedAt && nav(`/accounts/${a.id}`)} // Navigate to account detail if account is active.
                    >
                      {/* Name cell */}
                      <td
                        className="py-4 px-6 whitespace-nowrap"
                        onClick={(e) => {
                          // Prevent row navigation when clicking to edit the nickname.
                          e.stopPropagation();
                          if (a.closedAt) return; // Avoid editing closed accounts.
                          setEditingId(a.id);
                          setDraft(displayName);
                        }}
                      >
                        {isEditing ? (
                          // Input for editing the nickname
                          <Input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => saveNickname(a.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveNickname(a.id);
                              } else if (e.key === 'Escape') {
                                setEditingId(null); // Cancel editing on Escape key.
                              }
                            }}
                            className="h-8 w-40 rounded-sm border-border bg-background px-2 text-base"
                          />
                        ) : (
                          // Display nickname or account type along with account number.
                          <>
                            {displayName}
                            <span className="ml-2 text-xs text-text-secondary">({a.accountNumber})</span>
                          </>
                        )}
                      </td>

                      {/* Account number cell */}
                      <td className="py-4 px-6">{a.accountNumber}</td>

                      {/* Balance cell */}
                      <td className="py-4 px-6 text-right">
                        {(Number(a.balance) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                        {a.closedAt && <span className="ml-2 text-xs text-red-400">(closed)</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // Display message if no accounts are available.
            <p className="p-6 text-center text-text-secondary">No accounts yet.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {/* Create new account */}
          <Button onClick={createChecking} className="rounded-snout bg-piggy-brand px-8 py-3 text-lg hover:bg-piggy-brand-dark shadow-snout">
            + Create Account
          </Button>
          {/* Link to transfer funds */}
          <Link to="/transfer" className="inline-block">
            <Button className="rounded-snout bg-piggy-brand px-8 py-3 text-lg hover:bg-piggy-brand-dark shadow-snout">
              Transfer Funds
            </Button>
          </Link>
          {/* Link to pay bills */}
          <Link to="/paybill" className="inline-block">
            <Button className="rounded-snout bg-piggy-brand px-8 py-3 text-lg hover:bg-piggy-brand-dark shadow-snout">
              Pay Bill
            </Button>
          </Link>
        </div>
      </div>
    </Viewport>
  );
}
