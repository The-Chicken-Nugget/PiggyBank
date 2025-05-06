// src/pages/PayBill.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Viewport from '@/components/Viewport';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '../api';

// Helper function to convert a dollar amount to cents
const dollarsToCents = (v) => {
  const n = parseFloat(v);
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
};

// Helper function to check if a string is numeric
const isNumeric = (s) => /^[0-9]+$/.test(s);

// Common payees (demo account numbers)
export const PRESET_PAYEES = [
  { label: 'City Utilities', value: '67793480' },
  { label: 'Electric Company', value: '40033525' },
  { label: 'Gas', value: '57345775' },
  { label: 'Internet', value: '21120736' },
  { label: 'Apartment Rent', value: '00045295' },
  { label: 'Other (not listed)', value: 'OTHER' },
];

export default function PayBill() {
  const nav = useNavigate();

  // State to hold user accounts
  const [accounts, setAccounts] = useState([]);
  // State for the selected account to pay from
  const [from, setFrom] = useState('');
  // State for the selected payee from the preset list
  const [payee, setPayee] = useState(PRESET_PAYEES[0].value);
  // State for custom payee information when 'OTHER' is selected
  const [customPayee, setCustomPayee] = useState('');
  // State for the payment amount as string dollars
  const [amount, setAmount] = useState('');
  // State for an optional memo
  const [memo, setMemo] = useState('');
  // State for displaying error messages
  const [err, setErr] = useState('');

  // Live status for custom payee: '', 'checking', 'found', 'notfound'
  const [payeeStatus, setPayeeStatus] = useState('');

  // Load user accounts on mount
  useEffect(() => {
    api.get('/accounts').then((r) => {
      // Filter out closed accounts
      const open = r.data.filter((a) => !a.closedAt);
      // Set the accounts state with the open accounts
      setAccounts(open);
      // Pre-select the first open account if available
      if (open.length) setFrom(String(open[0].id));
    });
  }, []);

  // Live lookup for custom payee details when 'OTHER' is selected and input meets criteria
  useEffect(() => {
    // Skip lookup if a preset payee is selected
    if (payee !== 'OTHER') {
      setPayeeStatus('');
      return;
    }
    const num = customPayee.trim();
    // Skip lookup if the entered value is not numeric or too short
    if (!isNumeric(num) || num.length < 5) {
      setPayeeStatus('');
      return;
    }

    let active = true;
    setPayeeStatus('checking');
    // Fetch accounts to see if the custom payee is an internal account
    api.get('/accounts')
      .then((r) => {
        if (!active) return;
        const open = r.data.filter((a) => !a.closedAt);
        // Check if any account matches the custom payee number
        const found = open.some((a) => String(a.accountNumber) === num);
        setPayeeStatus(found ? 'found' : 'notfound');
      })
      .catch(() => active && setPayeeStatus(''));

    // Cleanup in case the component unmounts or dependencies change quickly
    return () => {
      active = false;
    };
  }, [payee, customPayee]);

  // Function to handle form submission for paying a bill
  async function submit(e) {
    e.preventDefault();
    setErr('');
    // Determine the payee value based on selection
    const realPayee = payee === 'OTHER' ? customPayee.trim() : payee;
    // Validate that required fields are provided
    if (!from || !realPayee || !amount) return setErr('All fields required');

    // Convert amount from dollars to cents
    const cents = dollarsToCents(amount);
    if (!cents) return setErr('Invalid amount');

    try {
      // Submit the pay bill API request
      await api.post(`/accounts/${from}/paybill`, {
        payee: realPayee,
        amount: cents,
        memo,
      });
      // Redirect to dashboard on success
      nav('/dashboard');
    } catch (x) {
      // Get error code from response and display an appropriate message
      const code = x.response?.data?.error;
      setErr(code === 'insufficient' ? 'Insufficient funds' : code || 'Pay‑bill failed');
    }
  }

  return (
    <Viewport>
      <div className="mx-auto w-full max-w-md space-y-10 px-4 py-8">
        {/* Header */}
        <h2 className="text-4xl font-semibold text-piggy-brand">Pay a Bill</h2>

        <Card className="rounded-snout bg-surface/70 shadow-snout backdrop-blur">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-6 text-left">
              {/* Display error message if present */}
              {err && <p className="text-sm text-red-500">{err}</p>}

              {/* From account selector */}
              <div>
                <label htmlFor="from" className="mb-1 block text-text-secondary">
                  From
                </label>
                <select
                  id="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-md border-border bg-background p-2 focus:border-piggy-brand"
                >
                  {/* Render a dropdown option for each open account */}
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountType} — {a.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payee selector */}
              <div>
                <label htmlFor="payee" className="mb-1 block text-text-secondary">
                  Payee
                </label>
                <select
                  id="payee"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className="w-full rounded-md border-border bg-background p-2 focus:border-piggy-brand"
                >
                  {/* Render a dropdown option for each preset payee */}
                  {PRESET_PAYEES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {/* Render custom payee input when 'OTHER' is selected */}
                {payee === 'OTHER' && (
                  <>
                    <Input
                      className="mt-2 border-border bg-background focus:border-piggy-brand"
                      placeholder="Enter payee name or account #"
                      value={customPayee}
                      onChange={(e) => setCustomPayee(e.target.value)}
                      onBlur={() => setCustomPayee((v) => v.trim())}
                      required
                    />
                    {/* Indicate lookup status for the custom payee */}
                    {payeeStatus === 'checking' && (
                      <p className="mt-1 text-sm text-text-secondary">Checking account number…</p>
                    )}
                    {payeeStatus === 'found' && (
                      <p className="mt-1 text-sm text-green-500">
                        Internal account detected — funds will arrive instantly.
                      </p>
                    )}
                    {payeeStatus === 'notfound' && (
                      <p className="mt-1 text-sm text-orange-500">
                        No open Piggy Bank account with that number — payment will be sent externally.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Payment amount input */}
              <Input
                type="number"
                step="0.01"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              {/* Optional memo input */}
              <Input
                placeholder="Memo (optional)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />

              {/* Submit Payment button */}
              <Button
                type="submit"
                className="w-full rounded-snout bg-piggy-brand shadow-snout hover:bg-piggy-brand-dark"
              >
                Submit Payment
              </Button>
              {/* Cancel button to navigate back to dashboard */}
              <Button
                variant="secondary"
                type="button"
                onClick={() => nav('/dashboard')}
                className="w-full rounded-snout"
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Viewport>
  );
}