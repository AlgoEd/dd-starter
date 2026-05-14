declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      BETTER_AUTH_SECRET: string
      NEXT_PUBLIC_SERVER_URL: string
      POSTGRES_URL: string
      AWS_EMAIL_ACCESS_KEY_ID?: string
      AWS_EMAIL_SECRET_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
