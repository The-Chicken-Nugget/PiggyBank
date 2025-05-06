// src/pages/Home.jsx – Landing page redesign (tweaks)
// This file contains the landing page of the application..

import { PiggyBank } from 'lucide-react'; // Importing the piggy bank icon from lucide-react
import { Link } from 'react-router-dom'; // Importing Link for client-side routing
import Viewport from '@/components/Viewport'; // Importing a component to manage viewport styling/layout
import { Button } from '@/components/ui/button'; // Importing a styled Button component

export default function Home() {
  return (
    // Viewport component ensures consistent page layout
    <Viewport>
      <div className="mx-auto flex min-h-[inherit] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 md:flex-row md:items-start">
        {/* left column: contains logo, headline, subcopy*/}
        <div className="max-w-md space-y-10">
          {/* Logo row: displays the piggy bank icon and the brand name */}
          <div className="flex items-center gap-3">
            <PiggyBank className="h-9 w-9 text-piggy-brand" />
            <span className="text-2xl font-bold tracking-wide text-text-primary">
              PIGGY&nbsp;BANK
            </span>
          </div>

          {/* Headline: main message for the landing page */}
          <h1 className="text-6xl font-extrabold leading-tight text-piggy-brand">
            Save with
            <br /> Piggy&nbsp;Bank
          </h1>

          {/* Subcopy: additional descriptive text */}
          <p className="text-xl text-text-secondary">
            Start saving today and achieve your financial goals.
          </p>

          {/* Call-to-Action: button that navigates to the registration page */}
          <Link to="/register" className="mt-8 inline-block">
            <Button className="rounded-snout bg-piggy-brand px-10 py-4 text-xl hover:bg-piggy-brand-dark shadow-snout">
              Open Account
            </Button>
          </Link>
        </div>

        {/* right column: contains sign‑in link and pig illustration */}
        <div className="relative flex w-full justify-center md:w-auto">
          {/* Sign‑in link: positioned at the top right */}
          <Link to="/login" className="absolute right-0 top-0 text-lg text-piggy-brand hover:underline">
            Sign in
          </Link>

          {/* Pig illustration*/}
          <PiggyBank className="h-72 w-72 text-piggy-brand/60" />
        </div>
      </div>
    </Viewport>
  );
}
