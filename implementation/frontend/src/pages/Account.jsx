// src/pages/Account.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import api from '../api';
import Viewport from '@/components/Viewport';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Utility function: Convert a dollar string value to cents (integer).
// Returns null if the input is not a valid positive number.
const dollarsToCents = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 100);
};

export default function Account() {
  // Get account id from URL parameters
  const { id } = useParams();
  // Navigation hook for routing actions
  const navigate = useNavigate();

  // State for account details
  const [account, setAccount] = useState(null);
  // State for transaction history
  const [tx, setTx] = useState(null);
  // State for error messages
  const [err, setErr] = useState('');

  // Deposit form state variables
  const [depositAmt, setDepositAmt] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw form state variables
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Function to load account and transaction data from the API
  const loadData = async () => {
    setErr('');
    try {
      // Fetch all accounts and find the current one based on the id from params
      const { data: accts } = await api.get('/accounts');
      const acc = accts.find((a) => String(a.id) === id);
      setAccount(acc);
      // Fetch transaction history for this account
      const { data: transactions } = await api.get(`/accounts/${id}/transactions`);
      setTx(transactions);
    } catch {
      setErr('Error loading account data');
    }
  };

  // Fetch data on component mount or when account id changes
  useEffect(() => {
    loadData();
  }, [id]);

  // Determine if the account is closed based on the closedAt property
  const isClosed = Boolean(account?.closedAt);

  // Logout handler: Logs out current user and navigates to the login page
  const handleLogout = async () => {
    await api.post('/logout');
    navigate('/login');
  };

  // Deposit handler: processes deposit form submission
  const handleDeposit = async (e) => {
    e.preventDefault();
    setErr('');
    const cents = dollarsToCents(depositAmt);
    if (!cents) {
      setErr('Enter a valid deposit amount');
      return;
    }
    setDepositLoading(true);
    try {
      // Make API call to deposit money into the account
      await api.post(`/accounts/${id}/deposit`, {
        amount: cents,
        description: depositDesc,
      });
      // Reset form fields on successful deposit
      setDepositAmt('');
      setDepositDesc('');
      await loadData();
    } catch (e) {
      setErr(e.response?.data?.error || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  // Withdraw handler: processes withdraw form submission
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErr('');
    const cents = dollarsToCents(withdrawAmt);
    if (!cents) {
      setErr('Enter a valid withdrawal amount');
      return;
    }
    setWithdrawLoading(true);
    try {
      // Make API call to withdraw money from the account
      await api.post(`/accounts/${id}/withdraw`, {
        amount: cents,
        description: withdrawDesc,
      });
      // Reset form fields on successful withdrawal
      setWithdrawAmt('');
      setWithdrawDesc('');
      await loadData();
    } catch (e) {
      const code = e.response?.data?.error;
      // Specific error message handling for insufficient funds
      setErr(code === 'insufficient' ? 'Insufficient funds' : code || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Close account handler: prompts user confirmation and closes the account
  const handleClose = async () => {
    setErr('');
    if (!window.confirm('Are you sure you want to close this account?')) return;
    try {
      // Make API call to close the account
      await api.post(`/accounts/${id}/close`);
      navigate('/dashboard');
    } catch (e) {
      const code = e.response?.data?.error;
      // Specific error message if balance is not zero
      setErr(code === 'non_zero_balance' ? 'Balance must be zero to close account' : code || 'Close failed');
    }
  };

  // Render loading state if transactions have not been loaded yet
  if (!tx && !err) return <Viewport>Loading…</Viewport>;

  // Render error state if an error occurred and no transactions available
  if (err && !tx) return (
    <Viewport>
      <p className="text-red-500">{err}</p>
    </Viewport>
  );

  return (
    <Viewport>
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        {/* Header section with logo and logout button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-9 w-9 text-piggy-brand" />
            <span className="text-2xl font-bold text-text-primary">PIGGY&nbsp;BANK</span>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-surface/60 hover:bg-surface rounded-snout px-6 py-2 text-sm shadow-snout"
          >
            Log out
          </Button>
        </div>

        {/* Account title and closed account banner */}
        <div className="space-y-2">
          <h2 className="text-5xl font-semibold text-piggy-brand">Account #{account?.accountNumber}</h2>
          {isClosed && (
            // Display date when account was closed
            <div className="rounded-snout bg-red-700/30 p-3 text-center text-red-200">
              This account was closed on {new Date(account.closedAt).toLocaleDateString()}.
            </div>
          )}
        </div>

        {/* Transactions table: displays list of transactions */}
        <div className="overflow-hidden rounded-snout bg-surface/60 backdrop-blur shadow-snout">
          {tx.length ? (
            <table className="w-full text-lg">
              <thead className="bg-surface/70 text-left text-piggy-brand-dark">
                <tr>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-border/40 hover:bg-background/40"
                  >
                    <td className="whitespace-nowrap py-4 px-6">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">{t.type}</td>
                    <td className="py-4 px-6">{t.description || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      {Number(t.amount / 100).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Message when no transactions exist
            <p className="p-6 text-center text-text-secondary">No transactions yet.</p>
          )}
        </div>

        {/* Deposit & Withdraw sections (only if account is open) */}
        {!isClosed && (
          <>
            {/* Deposit form card */}
            <Card className="rounded-snout bg-surface/70 shadow-snout backdrop-blur">
              <CardContent className="p-6">
                <form onSubmit={handleDeposit} className="space-y-4 text-left">
                  <h3 className="text-xl font-medium text-text-primary">Deposit</h3>
                  {err && <p className="text-sm text-red-500">{err}</p>}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount ($)"
                      value={depositAmt}
                      onChange={(e) => setDepositAmt(e.target.value)}
                      className="border-border bg-background focus:border-piggy-brand focus:ring-piggy-brand-dark"
                      required
                    />
                    <Input
                      placeholder="Description"
                      value={depositDesc}
                      onChange={(e) => setDepositDesc(e.target.value)}
                      className="border-border bg-background focus:border-piggy-brand focus:ring-piggy-brand-dark"
                    />
                    <Button
                      type="submit"
                      disabled={depositLoading}
                      className="w-full rounded-snout bg-piggy-brand shadow-snout hover:bg-piggy-brand-dark"
                    >
                      {depositLoading ? 'Depositing…' : 'Deposit'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Withdraw form card */}
            <Card className="rounded-snout bg-surface/70 shadow-snout backdrop-blur">
              <CardContent className="p-6">
                <form onSubmit={handleWithdraw} className="space-y-4 text-left">
                  <h3 className="text-xl font-medium text-text-primary">Withdraw</h3>
                  {err && <p className="text-sm text-red-500">{err}</p>}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount ($)"
                      value={withdrawAmt}
                      onChange={(e) => setWithdrawAmt(e.target.value)}
                      className="border-border bg-background focus:border-piggy-brand focus:ring-piggy-brand-dark"
                      required
                    />
                    <Input
                      placeholder="Description"
                      value={withdrawDesc}
                      onChange={(e) => setWithdrawDesc(e.target.value)}
                      className="border-border bg-background focus:border-piggy-brand focus:ring-piggy-brand-dark"
                    />
                    <Button
                      type="submit"
                      disabled={withdrawLoading}
                      className="w-full rounded-snout bg-piggy-brand shadow-snout hover:bg-piggy-brand-dark"
                    >
                      {withdrawLoading ? 'Withdrawing…' : 'Withdraw'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Action buttons: Close Account (if open) and Back to Accounts */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {!isClosed && (
            <Button
              onClick={handleClose}
              className="rounded-snout bg-destructive px-6 py-3 text-white shadow-snout hover:bg-destructive/90"
            >
              Close Account
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="rounded-snout px-6 py-3"
          >
            Back to Accounts
          </Button>
        </div>
      </div>
    </Viewport>
  );
}