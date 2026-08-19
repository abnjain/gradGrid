-- Allow platform role assignments without an institution scope.
ALTER TABLE "role_assignments" ALTER COLUMN "institution_id" DROP NOT NULL;
