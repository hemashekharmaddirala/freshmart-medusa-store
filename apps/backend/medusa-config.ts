import path from "path"
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const backendUrl = (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(
  /\/$/,
  ""
)

const localFileProvider = {
  resolve: "@medusajs/medusa/file-local",
  id: "local",
  options: {
    upload_dir: process.env.LOCAL_FILE_UPLOAD_DIR || path.join(process.cwd(), "static"),
    private_upload_dir:
      process.env.LOCAL_FILE_PRIVATE_UPLOAD_DIR || path.join(process.cwd(), "static"),
    backend_url: `${backendUrl}/static`,
  },
}

const s3FileProvider = {
  resolve: "@medusajs/medusa/file-s3",
  id: "s3",
  options: {
    file_url: process.env.S3_FILE_URL,
    access_key_id: process.env.S3_ACCESS_KEY_ID,
    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    session_token: process.env.S3_SESSION_TOKEN,
    authentication_method: process.env.S3_AUTHENTICATION_METHOD || "access-key",
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    endpoint: process.env.S3_ENDPOINT,
    prefix: process.env.S3_PREFIX,
    cache_control: process.env.S3_CACHE_CONTROL,
  },
}

const fileProvider =
  process.env.FILE_PROVIDER === "s3" || process.env.S3_FILE_URL
    ? s3FileProvider
    : localFileProvider

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    backendUrl,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [fileProvider],
      },
    },
    {
      resolve: "./src/modules/review",
    },
  ],
})
