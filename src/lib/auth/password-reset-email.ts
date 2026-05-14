import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { logger } from '@/services/logger'

type ResetPasswordUser = {
  email: string
  name?: string | null
}

type SendPasswordResetEmailArgs = {
  user: ResetPasswordUser
  url: string
}

const sesRegion = 'ap-southeast-1'
const configurationSetName = 'EmailDeliveryStatus'
const fromAddress = '"AlgoEd" <donotreply@emails.algoed.co>'
const replyToAddress = 'support@algoed.co'

export async function sendPasswordResetEmail({ user, url }: SendPasswordResetEmailArgs) {
  const accessKeyId = process.env.AWS_EMAIL_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_EMAIL_SECRET_KEY

  if (!accessKeyId || !secretAccessKey) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn({ email: user.email, url }, 'Password reset email not configured')
      return
    }

    throw new Error('Password reset email is not configured')
  }

  const greeting = user.name ? `Hi ${user.name},` : 'Hi,'
  const text = `${greeting}

Reset your AlgoEd Pages password here:
${url}

If you did not request this, you can ignore this email.`

  const sesClient = new SESv2Client({
    region: sesRegion,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  await sesClient.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [user.email],
      },
      FromEmailAddress: fromAddress,
      ReplyToAddresses: [replyToAddress],
      ConfigurationSetName: configurationSetName,
      Content: {
        Simple: {
          Subject: {
            Charset: 'UTF-8',
            Data: 'Reset your AlgoEd Pages password',
          },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: text,
            },
          },
        },
      },
    }),
  )
}
