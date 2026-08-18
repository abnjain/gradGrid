-- CreateTable
CREATE TABLE "institution_signup_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "organization_name" VARCHAR(200) NOT NULL,
    "institution_name" VARCHAR(200) NOT NULL,
    "institution_code" VARCHAR(20) NOT NULL,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_hash" TEXT,
    "otp_expires_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "created_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_signup_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "institution_signup_requests_email_idx" ON "institution_signup_requests"("email");
CREATE INDEX "institution_signup_requests_phone_idx" ON "institution_signup_requests"("phone");
CREATE INDEX "institution_signup_requests_status_idx" ON "institution_signup_requests"("status");
CREATE INDEX "institution_signup_requests_institution_code_idx" ON "institution_signup_requests"("institution_code");

ALTER TABLE "institution_signup_requests" ADD CONSTRAINT "institution_signup_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "institution_signup_requests" ADD CONSTRAINT "institution_signup_requests_created_user_id_fkey" FOREIGN KEY ("created_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
