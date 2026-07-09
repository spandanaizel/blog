import { Link, Outlet } from 'react-router-dom';
import { Feather, PenTool, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const highlights = [
  { icon: PenTool, text: 'A distraction-free editor built for long-form writing' },
  { icon: Users, text: 'A community that actually reads what you publish' },
  { icon: TrendingUp, text: 'Real analytics on views, reads, and engagement' },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/15">
            <Feather className="h-5 w-5" />
          </span>
          Inkwell
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <h2 className="text-3xl font-bold leading-tight">Read. Write. Connect.</h2>
          <p className="mt-3 text-primary-foreground/80">
            Inkwell is where independent writers and curious readers meet — no algorithm games, just good ideas.
          </p>

          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} Inkwell</p>

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 font-extrabold text-lg lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Feather className="h-4 w-4" />
            </span>
            Inkwell
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
