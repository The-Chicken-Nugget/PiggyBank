// src/pages/Transfer.jsx – Transfer money between accounts 
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Viewport from '@/components/Viewport';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '../api';

// Convert a dollar string to integer cents (e.g. '12.34' → 1234)
const dollarsToCents = (val) => {
    // Convert string value to a floating point number
    const num = parseFloat(val);
    // Reject if not a number or if the amount is non-positive
    if (isNaN(num) || num <= 0) return null;
    // Return the rounded value in cents
    return Math.round(num * 100);
};

export default function Transfer() {
    const navigate = useNavigate();
    
    // State to hold list of accounts
    const [accounts, setAccounts] = useState([]);
    // State for the selected account ID (from which to transfer funds)
    const [fromId, setFromId] = useState('');
    // State to hold the destination account number input
    const [toAccountNumber, setToNumber] = useState('');
    // State to hold the transfer amount as a string input
    const [amount, setAmount] = useState('');
    // State to hold an optional memo for the transfer
    const [memo, setMemo] = useState('');
    // State to hold error messages to show to the user
    const [err, setErr] = useState('');

    // Fetch accounts when component mounts
    useEffect(() => {
        api.get('/accounts')
            .then((r) => {
                // Filter out closed accounts
                const open = r.data.filter((a) => !a.closedAt);
                // Update state with open accounts data
                setAccounts(open);
                if (open.length) {
                    // Set default selected account to the first open account in the list (as a string)
                    setFromId(String(open[0].id));
                }
            })
            .catch(() => setErr('Failed to load accounts')); // Handle error while fetching accounts
    }, []);

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear any previous errors
        setErr('');
        
        // Basic validation: check if required fields are provided
        if (!fromId || !toAccountNumber || !amount) {
            setErr('All fields are required');
            return;
        }
        
        // Convert the dollar amount to cents and validate
        const cents = dollarsToCents(amount);
        if (!cents) {
            setErr('Enter a valid positive amount');
            return;
        }

        try {
            // Send a transfer request to the API for the given account
            await api.post(`/accounts/${fromId}/transfer`, {
                toAccountNumber,
                amount: cents,
                memo: memo || undefined, // Only include memo if provided
            });
            // On successful transfer, navigate back to the dashboard so that balances refresh
            navigate('/dashboard');
        } catch (e) {
            // Handle API error and set an appropriate error message based on response error code
            const code = e.response?.data?.error;
            if (code === 'insufficient') {
                setErr('Insufficient funds');
            } else {
                setErr(code || 'Transfer failed');
            }
        }
    };

    return (
        <Viewport>
            <div className="mx-auto w-full max-w-md space-y-10 px-4 py-8">
                {/* Page title */}
                <h2 className="text-4xl font-semibold text-piggy-brand">Transfer Funds</h2>

                <Card className="bg-surface/70 backdrop-blur rounded-snout shadow-snout">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {/* Display error message if there is an error */}
                            {err && <p className="text-sm text-red-500">{err}</p>}

                            {/* From Account dropdown field */}
                            <div className="space-y-2">
                                <label htmlFor="from" className="block text-text-secondary">
                                    From Account
                                </label>
                                <select
                                    id="from"
                                    value={fromId}
                                    onChange={(e) => setFromId(e.target.value)}
                                    className="w-full bg-background border-border rounded-md p-2 focus:border-piggy-brand focus:ring-piggy-brand-dark"
                                >
                                    {/* Map each open account to an option element */}
                                    {accounts.map((a) => (
                                        <option key={a.id} value={String(a.id)}>
                                            {a.accountType} — {a.accountNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* To Account number input */}
                            <div className="space-y-2">
                                <label htmlFor="to" className="block text-text-secondary">
                                    To Account #
                                </label>
                                <Input
                                    id="to"
                                    placeholder="12345678"
                                    value={toAccountNumber}
                                    onChange={(e) => setToNumber(e.target.value)}
                                    className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                                    required
                                />
                            </div>

                            {/* Dollar amount input */}
                            <div className="space-y-2">
                                <label htmlFor="amount" className="block text-text-secondary">
                                    Amount ($)
                                </label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                                    required
                                />
                            </div>

                            {/* Optional memo input */}
                            <div className="space-y-2">
                                <label htmlFor="memo" className="block text-text-secondary">
                                    Memo (optional)
                                </label>
                                <Input
                                    id="memo"
                                    placeholder="e.g. Rent April 2025"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                                />
                            </div>

                            {/* Button group for form actions */}
                            <Button
                                type="submit"
                                className="w-full bg-piggy-brand hover:bg-piggy-brand-dark rounded-snout shadow-snout"
                            >
                                Submit Transfer
                            </Button>

                            {/* Cancel button: Returns user to the dashboard */}
                            <Button
                                variant="secondary"
                                className="w-full rounded-snout"
                                onClick={() => navigate('/dashboard')}
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
