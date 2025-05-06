// src/pages/Register.jsx

// Import necessary hooks and components
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import api from '../api';
import Viewport from '@/components/Viewport';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Register() {
  // State hooks for form inputs and error message
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [pw2, setPw2]       = useState('');
  const [err, setErr]       = useState('');

  // Form submit handler
  const handle = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if passwords match
    if (pw !== pw2) {
      setErr('Passwords do not match');
      return;
    }
    setErr('');

    // Try to register and then login user
    try {
      // Register user
      await api.post('/register', { name, email, password: pw });
      // Login user after registration
      await api.post('/login', { email, password: pw });
      // Redirect to dashboard after successful login
      window.location = '/dashboard';
    } catch (e) {
      // Handle and display error message from server response
      setErr(e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Viewport>
      <div className="relative mx-auto w-full max-w-md space-y-10 px-4 text-left">
        {/* Logo Section */}
        <header className="flex items-center gap-3">
          <PiggyBank className="h-9 w-9 text-piggy-brand" />
          <h1 className="text-3xl font-bold tracking-wide text-text-primary">
            PIGGY&nbsp;BANK
          </h1>
        </header>

        {/* Heading */}
        <h2 className="text-4xl font-semibold text-piggy-brand">Create an account</h2>

        {/* Form Card */}
        <Card className="relative overflow-hidden bg-surface/70 backdrop-blur rounded-snout shadow-snout">
          <CardContent className="p-6">
            {/* Registration Form */}
            <form onSubmit={handle} className="space-y-6">
              {/* Display error message if any */}
              {err && <p className="text-sm text-red-500">{err}</p>}

              {/* Name input field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-text-secondary">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                  required
                />
              </div>

              {/* Email input field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-text-secondary">
                  Email
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

              {/* Password input field */}
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

              {/* Confirm password input field */}
              <div className="space-y-2">
                <label htmlFor="confirm" className="block text-text-secondary">
                  Confirm Password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="bg-background border-border focus:border-piggy-brand focus:ring-piggy-brand-dark"
                  required
                />
              </div>

              {/* Submit button */}
              <Button type="submit" className="w-full bg-piggy-brand hover:bg-piggy-brand-dark rounded-snout shadow-snout">
                Sign Up
              </Button>

              {/* Link to sign in page */}
              <p className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-piggy-brand hover:underline">
                  Sign In
                </Link>
              </p>
            </form>

            {/* pig illustration positioned absolutely */}
            <PiggyBank className="absolute -bottom-8 -right-8 h-28 w-28 text-piggy-brand/60 pointer-events-none" />
          </CardContent>
        </Card>
      </div>
    </Viewport>
  );
}
