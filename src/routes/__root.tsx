import {
  HeadContent,
  Scripts,
  createRootRoute,
  Link,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Compass, Home, ArrowLeft } from 'lucide-react'
import { ToastProvider } from '#/components/ui/toast'
import { Button } from '#/components/ui/button'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ghar Bhandaa - Room Rent Collection System',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => <NotFound />,
})

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center rise-in">
      <div className="island-shell max-w-md w-full p-8 rounded-3xl flex flex-col items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-[linear-gradient(135deg,var(--lagoon),#7ed3bf)] flex items-center justify-center text-white shadow-lg animate-pulse">
          <Compass className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="island-kicker block text-xs">404 Error</span>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--sea-ink-soft)] max-w-xs mx-auto">
            The page you are looking for might have been moved, deleted, or
            doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            render={
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            }
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <ToastProvider position="top-right">
          {children}
        </ToastProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
