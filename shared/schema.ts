import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index, jsonb, pgTable, timestamp, varchar, text, boolean, integer, pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }, (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPlan: varchar("current_plan").notNull().default('free'),
  planExpiresAt: timestamp("plan_expires_at"),
  isAdmin: boolean("is_admin").default(false),
  geminiApiKey: text("gemini_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const connectionStatusEnum = pgEnum('connection_status', ['disconnected', 'connecting', 'connected', 'qr_ready']);
export const whatsappDevices = pgTable("whatsapp_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  phoneNumber: varchar("phone_number"),
  connectionStatus: connectionStatusEnum("connection_status").notNull().default('disconnected'),
  qrCode: text("qr_code"),
  lastConnectedAt: timestamp("last_connected_at"),
  activeLogicId: varchar("active_logic_id"),
  isPaused: boolean("is_paused").notNull().default(false),
  shouldTranscribe: boolean("should_transcribe").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => whatsappDevices.id, { onDelete: 'cascade' }),
  contactName: varchar("contact_name").notNull(),
  contactPhone: varchar("contact_phone").notNull(),
  contactProfilePic: text("contact_profile_pic"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  unreadCount: integer("unread_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageDirectionEnum = pgEnum('message_direction', ['incoming', 'outgoing']);
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  direction: messageDirectionEnum("direction").notNull(),
  content: text("content").notNull(),
  isFromBot: boolean("is_from_bot").notNull().default(false),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logicTypeEnum = pgEnum('logic_type', ['json', 'ai', 'hybrid']);
export const logicConfigs = pgTable("logic_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceId: varchar("device_id").references(() => whatsappDevices.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  logicType: logicTypeEnum("logic_type").notNull().default('json'),
  logicJson: jsonb("logic_json").notNull(),
  behaviorConfigId: varchar("behavior_config_id"),
  isActive: boolean("is_active").notNull().default(true),
  isTemplate: boolean("is_template").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"),
  imageUrls: text("image_urls").array(),
  tags: text("tags").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botBehaviorConfigs = pgTable("bot_behavior_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  tone: varchar("tone").notNull().default('professional'),
  personality: text("personality").notNull(),
  responseStyle: varchar("response_style").notNull().default('concise'),
  customInstructions: text("custom_instructions"),
  isActive: boolean("is_active").notNull().default(true),
  isPreset: boolean("is_preset").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const broadcastStatusEnum = pgEnum('broadcast_status', ['pending', 'running', 'paused', 'completed', 'failed']);
export const broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceId: varchar("device_id").notNull().references(() => whatsappDevices.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  message: text("message").notNull(),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type"),
  mediaUrls: text("media_urls").array(),
  mediaTypes: text("media_types").array(),
  status: broadcastStatusEnum("status").notNull().default('pending'),
  totalContacts: integer("total_contacts").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  delay: integer("delay").default(20),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const broadcastContacts = pgTable("broadcast_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  broadcastId: varchar("broadcast_id").notNull().references(() => broadcasts.id, { onDelete: 'cascade' }),
  contactName: varchar("contact_name").notNull(),
  contactPhone: varchar("contact_phone").notNull(),
  status: varchar("status").notNull().default('pending'),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webAssistants = pgTable("web_assistants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  themeColor: varchar("theme_color").default('#000000'),
  activeLogicId: varchar("active_logic_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const broadcastTemplates = pgTable("broadcast_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  mediaTypes: text("media_types").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  content: text("content").notNull(),
  category: varchar("category"),
  mediaUrls: text("media_urls").array(),
  mediaTypes: text("media_types").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logCategoryEnum = pgEnum('log_category', ['whatsapp', 'ai', 'bot', 'system', 'broadcast']);
export const logLevelEnum = pgEnum('log_level', ['info', 'warning', 'error']);
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  deviceId: varchar("device_id").references(() => whatsappDevices.id, { onDelete: 'set null' }),
  category: logCategoryEnum("category").notNull(),
  level: logLevelEnum("level").notNull().default('info'),
  message: text("message").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  whatsappDevices: many(whatsappDevices),
  logicConfigs: many(logicConfigs),
  knowledgeBase: many(knowledgeBase),
  webAssistants: many(webAssistants),
}));

export const whatsappDevicesRelations = relations(whatsappDevices, ({ one, many }) => ({
  user: one(users, { fields: [whatsappDevices.userId], references: [users.id] }),
  conversations: many(conversations),
  logicConfigs: many(logicConfigs),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  device: one(whatsappDevices, { fields: [conversations.deviceId], references: [whatsappDevices.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const webAssistantsRelations = relations(webAssistants, ({ one }) => ({
  user: one(users, { fields: [webAssistants.userId], references: [users.id] }),
  activeLogic: one(logicConfigs, { fields: [webAssistants.activeLogicId], references: [logicConfigs.id] }),
}));

export const logicConfigsRelations = relations(logicConfigs, ({ one }) => ({
  user: one(users, { fields: [logicConfigs.userId], references: [users.id] }),
  device: one(whatsappDevices, { fields: [logicConfigs.deviceId], references: [whatsappDevices.id] }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  user: one(users, { fields: [knowledgeBase.userId], references: [users.id] }),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, { fields: [systemLogs.userId], references: [users.id] }),
  device: one(whatsappDevices, { fields: [systemLogs.deviceId], references: [whatsappDevices.id] }),
}));
