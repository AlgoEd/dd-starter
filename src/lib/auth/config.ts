import type { BetterAuthOptions } from 'better-auth'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { apiKey } from '@better-auth/api-key'
import { sendPasswordResetEmail } from './password-reset-email'
import { logger } from '@/services/logger'

export const betterAuthOptions: Partial<BetterAuthOptions> = {
  // Model names are SINGULAR - they get pluralized automatically
  // 'user' becomes 'users', 'session' becomes 'sessions', etc.
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user' },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  // Disable public registration — visitors who know the URL should not be able to create accounts.
  // Admins can still create users through the Payload Admin Panel (Local API bypasses access control).
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({ user, url }).catch((error) => {
        logger.error({ err: error, email: user.email }, 'Failed to send password reset email')
      })
    },
  },
  plugins: [
    twoFactor(),
    apiKey({ enableMetadata: true }),
    passkey(),
  ],
}
