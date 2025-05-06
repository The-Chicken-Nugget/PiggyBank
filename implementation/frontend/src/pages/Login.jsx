// src/pages/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import api from '../api';
import Viewport from '@/components/Viewport';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  // State for storing email input
  const [email, setEmail] = useState('');
  // State for storing password input
  const [pw, setPw] = useState('');
  // State for storing error message on failed login
  const [err, setErr] = useState('');

  // Function to handle form submission
  const handle = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setErr(''); // Clear any existing error messages
    try {
      // Post email and password to the login endpoint
      await api.post('/login', { email, password: pw });
      // On successful login, redirect user to dashboard
      window.location = '/dashboard';
    } catch {
      // If there's an error, set the error message to display feedback
      setErr('Wrong credentials');
    }
  };

  return (
    <Viewport>
      <div className="mx-auto w-full max-w-md space-y-10 px-4 text-left">
        {/* Header: Logo and title */}
        <header className="flex items-center gap-3">
          <PiggyBank className="h-9 w-9 text-piggy-brand" />
          <h1 className="text-3xl font-bold tracking-wide text-text-primary">PIGGY&nbsp;BANK</h1>
        </header>

        {/* Heading for the login form */}
        <h2 className="text-4xl font-semibold text-piggy-brand">Login</h2>

        {/* Form container card with styling */}
        <Card className="bg-surface/70 backdrop-blur rounded-snout shadow-snout">
          <CardContent className="p-6">
            <form onSubmit={handle} className="space-y-6">
              {/* Display error message if login fails */}
              {err && <p className="text-sm text-red-500">{err}</p>}

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-text-secondary">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-text-secondary">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                  required
                />
              </div>

              {/* Submit button */}
              <Button type="submit" className="w-full bg-piggy-brand hover:bg-piggy-brand-dark rounded-snout shadow-snout">
                Log in
              </Button>

              {/* Link to "forgot password" page */}
              {/* <div className="text-center text-sm">
                <Link to="#" className="text-piggy-brand hover:underline">
                  Forgot password?
                </Link>
              </div> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </Viewport>
  );
}
