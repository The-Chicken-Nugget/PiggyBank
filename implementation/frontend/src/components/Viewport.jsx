export default function Viewport({ children }) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-900 px-4 text-zinc-100">
        {children}
      </main>
    );
  }
  