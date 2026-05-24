import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LandlordHeader from '#/components/LandlordHeader'
import Footer from '#/components/Footer'
import { checkLandlordAuth } from '#/server/auth.functions'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const authStatus = await checkLandlordAuth()
    if (!authStatus.authenticated) {
      throw redirect({
        to: '/login',
      })
    }
    return authStatus
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandlordHeader />
      <main className="flex-grow py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
