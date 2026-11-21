-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'SCHEDULED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EnquiryKind" AS ENUM ('APPOINTMENT', 'CONTACT');

-- CreateEnum
CREATE TYPE "AnalyticsEventName" AS ENUM ('session_start', 'page_view', 'heartbeat');

-- CreateEnum
CREATE TYPE "ChatConversationStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatSenderType" AS ENUM ('VISITOR', 'ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "enquiries" (
    "id" UUID NOT NULL,
    "kind" "EnquiryKind" NOT NULL,
    "parent_name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(254),
    "child_name" VARCHAR(120),
    "child_age" VARCHAR(40),
    "service" VARCHAR(120),
    "request_type" VARCHAR(60),
    "preferred_date" DATE,
    "message" TEXT,
    "locale" VARCHAR(8) NOT NULL DEFAULT 'en',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "admin_notes" TEXT NOT NULL DEFAULT '',
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "password" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "author" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "ads" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" "AnalyticsEventName" NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "path" TEXT NOT NULL DEFAULT '/',
    "title" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screen" TEXT,
    "lang" TEXT,
    "country" TEXT,
    "city" TEXT,
    "active_seconds" INTEGER NOT NULL DEFAULT 0,
    "ip_hash" TEXT,
    "day_key" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_ip_cache" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "isp" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geo_ip_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_settings" (
    "id" INTEGER NOT NULL,
    "pricing_page_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_page_contents" (
    "id" SERIAL NOT NULL,
    "locale" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "section_key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "plan_key" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "badge" TEXT,
    "icon" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "users_label" TEXT,
    "users_count" INTEGER,
    "currency" TEXT,
    "setup_fee" DECIMAL(12,2),
    "monthly_fee" DECIMAL(12,2),
    "quarterly_fee" DECIMAL(12,2),
    "server_fee" DECIMAL(12,2),
    "cta" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plan_features" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_faqs" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_modules" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "user_id" TEXT,
    "visitor_name" VARCHAR(120) NOT NULL,
    "visitor_email" VARCHAR(254),
    "visitor_phone" VARCHAR(40),
    "locale" VARCHAR(8) NOT NULL DEFAULT 'en',
    "status" "ChatConversationStatus" NOT NULL DEFAULT 'OPEN',
    "start_path" VARCHAR(512),
    "current_path" VARCHAR(512),
    "user_agent" VARCHAR(512),
    "ip_hash" VARCHAR(64),
    "visitor_last_seen_at" TIMESTAMPTZ(3),
    "last_message_at" TIMESTAMPTZ(3),
    "last_message_preview" VARCHAR(200),
    "closed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_type" "ChatSenderType" NOT NULL,
    "sender_user_id" TEXT,
    "sender_name" VARCHAR(120),
    "body" TEXT NOT NULL,
    "image_id" UUID,
    "reactions_updated_at" TIMESTAMPTZ(3),
    "client_id" VARCHAR(64) NOT NULL,
    "delivered_at" TIMESTAMPTZ(3),
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_reactions" (
    "message_id" UUID NOT NULL,
    "actor" VARCHAR(64) NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,

    CONSTRAINT "chat_reactions_pkey" PRIMARY KEY ("message_id","actor")
);

-- CreateTable
CREATE TABLE "chat_images" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_type" "ChatSenderType" NOT NULL,
    "sender_user_id" TEXT,
    "mime" VARCHAR(32) NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_typing" (
    "conversation_id" UUID NOT NULL,
    "actor" VARCHAR(160) NOT NULL,
    "sender_type" "ChatSenderType" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "chat_typing_pkey" PRIMARY KEY ("conversation_id","actor")
);

-- CreateTable
CREATE TABLE "chat_agent_presence" (
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(120),
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "chat_agent_presence_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("created_at");

-- CreateIndex
CREATE INDEX "enquiries_status_created_at_idx" ON "enquiries"("status", "created_at");

-- CreateIndex
CREATE INDEX "enquiries_kind_created_at_idx" ON "enquiries"("kind", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "analytics_events_day_key_idx" ON "analytics_events"("day_key");

-- CreateIndex
CREATE INDEX "analytics_events_ip_hash_day_key_idx" ON "analytics_events"("ip_hash", "day_key");

-- CreateIndex
CREATE INDEX "analytics_events_ts_idx" ON "analytics_events"("ts");

-- CreateIndex
CREATE INDEX "analytics_events_event_ts_idx" ON "analytics_events"("event", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_visitor_id_ts_idx" ON "analytics_events"("visitor_id", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_ts_idx" ON "analytics_events"("session_id", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_path_ts_idx" ON "analytics_events"("path", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_utm_source_ts_idx" ON "analytics_events"("utm_source", "ts");

-- CreateIndex
CREATE INDEX "analytics_events_device_type_ts_idx" ON "analytics_events"("device_type", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "geo_ip_cache_ip_key" ON "geo_ip_cache"("ip");

-- CreateIndex
CREATE INDEX "geo_ip_cache_updatedAt_idx" ON "geo_ip_cache"("updatedAt");

-- CreateIndex
CREATE INDEX "pricing_page_contents_locale_page_type_idx" ON "pricing_page_contents"("locale", "page_type");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_page_contents_locale_page_type_section_key_key" ON "pricing_page_contents"("locale", "page_type", "section_key");

-- CreateIndex
CREATE INDEX "pricing_plans_locale_order_idx" ON "pricing_plans"("locale", "order");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_locale_plan_key_key" ON "pricing_plans"("locale", "plan_key");

-- CreateIndex
CREATE INDEX "pricing_plan_features_plan_id_order_idx" ON "pricing_plan_features"("plan_id", "order");

-- CreateIndex
CREATE INDEX "pricing_faqs_locale_page_type_order_idx" ON "pricing_faqs"("locale", "page_type", "order");

-- CreateIndex
CREATE INDEX "pricing_modules_locale_order_idx" ON "pricing_modules"("locale", "order");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_token_hash_key" ON "chat_conversations"("token_hash");

-- CreateIndex
CREATE INDEX "chat_conversations_status_last_message_at_idx" ON "chat_conversations"("status", "last_message_at");

-- CreateIndex
CREATE INDEX "chat_conversations_user_id_idx" ON "chat_conversations"("user_id");

-- CreateIndex
CREATE INDEX "chat_conversations_last_message_at_idx" ON "chat_conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_created_at_idx" ON "chat_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_sender_type_read_at_idx" ON "chat_messages"("conversation_id", "sender_type", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_messages_conversation_id_client_id_key" ON "chat_messages"("conversation_id", "client_id");

-- CreateIndex
CREATE INDEX "chat_images_conversation_id_created_at_idx" ON "chat_images"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_typing_expires_at_idx" ON "chat_typing"("expires_at");

-- CreateIndex
CREATE INDEX "chat_agent_presence_last_seen_at_idx" ON "chat_agent_presence"("last_seen_at");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_plan_features" ADD CONSTRAINT "pricing_plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "pricing_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "chat_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_reactions" ADD CONSTRAINT "chat_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_images" ADD CONSTRAINT "chat_images_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_typing" ADD CONSTRAINT "chat_typing_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

