import { createFileRoute } from '@tanstack/react-router'
import { SignupPage } from '#/components/views/SignupPage'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})
