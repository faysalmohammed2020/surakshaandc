CREATE TABLE "admin_inbox_seen" (
    "user_id" TEXT NOT NULL,
    "chat_seen_at" TIMESTAMPTZ(3),
    "enquiries_seen_at" TIMESTAMPTZ(3),
    CONSTRAINT "admin_inbox_seen_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "admin_inbox_seen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
