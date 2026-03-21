-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Pathology" ADD COLUMN     "contentJson" JSONB,
ADD COLUMN     "contentText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "contentJson" JSONB,
ADD COLUMN     "contentText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "dueAt" TIMESTAMP(3);

-- Backfill contentText from old content
UPDATE "Pathology" SET "contentText" = COALESCE("content", '') WHERE "contentText" = '';
UPDATE "Protocol" SET "contentText" = COALESCE("content", '') WHERE "contentText" = '';

-- Drop old content columns
ALTER TABLE "Pathology" DROP COLUMN "content";
ALTER TABLE "Protocol" DROP COLUMN "content";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Search vector triggers (Pathology)
CREATE FUNCTION pathology_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('russian',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.subtitle, '') || ' ' ||
    COALESCE(NEW."contentText", '')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER pathology_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Pathology"
FOR EACH ROW EXECUTE FUNCTION pathology_search_vector_update();

-- Search vector triggers (Protocol)
CREATE FUNCTION protocol_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('russian',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW."contentText", '')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER protocol_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Protocol"
FOR EACH ROW EXECUTE FUNCTION protocol_search_vector_update();

-- Backfill vectors
UPDATE "Pathology" SET "searchVector" = to_tsvector('russian',
  COALESCE(title, '') || ' ' || COALESCE(subtitle, '') || ' ' || COALESCE("contentText", '')
);
UPDATE "Protocol" SET "searchVector" = to_tsvector('russian',
  COALESCE(title, '') || ' ' || COALESCE("contentText", '')
);
