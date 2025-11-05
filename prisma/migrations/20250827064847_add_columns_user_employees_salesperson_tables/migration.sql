-- AlterTable
ALTER TABLE "erpnext"."employees" ADD COLUMN     "creation" TIMESTAMP(6),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "employee_name" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "modified" TIMESTAMP(6),
ADD COLUMN     "modified_by" TEXT,
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "erpnext"."sales_persons" ADD COLUMN     "bizfly_id" TEXT,
ADD COLUMN     "creation" TIMESTAMP(6),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "enabled" SMALLINT,
ADD COLUMN     "is_group" SMALLINT,
ADD COLUMN     "modified" TIMESTAMP(6),
ADD COLUMN     "modified_by" TEXT,
ADD COLUMN     "old_parent" TEXT,
ADD COLUMN     "parent_sales_person" TEXT,
ADD COLUMN     "sales_person_name" TEXT,
ADD COLUMN     "sales_region" TEXT,
ADD COLUMN     "targets" JSONB;

-- AlterTable
ALTER TABLE "erpnext"."users" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "creation" TIMESTAMP(6),
ADD COLUMN     "enabled" SMALLINT,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "modified" TIMESTAMP(6),
ADD COLUMN     "modified_by" TEXT,
ADD COLUMN     "pancake_id" TEXT,
ADD COLUMN     "role_profile" TEXT,
ADD COLUMN     "time_zone" TEXT,
ADD COLUMN     "user_image" TEXT;
