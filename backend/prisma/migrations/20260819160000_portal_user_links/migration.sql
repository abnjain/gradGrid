-- Link students/parents to optional portal login accounts
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "user_id" UUID;
ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "user_id" UUID;

CREATE INDEX IF NOT EXISTS "students_user_id_idx" ON "students"("user_id");
CREATE INDEX IF NOT EXISTS "parents_user_id_idx" ON "parents"("user_id");
CREATE INDEX IF NOT EXISTS "parents_institution_id_idx" ON "parents"("institution_id");

DO $$ BEGIN
  ALTER TABLE "students"
    ADD CONSTRAINT "students_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "parents"
    ADD CONSTRAINT "parents_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
