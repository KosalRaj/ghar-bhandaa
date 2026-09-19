import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '#/components/views/LandingPage'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
