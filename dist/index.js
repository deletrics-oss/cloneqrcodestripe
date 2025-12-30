var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  botBehaviorConfigs: () => botBehaviorConfigs,
  broadcastContacts: () => broadcastContacts,
  broadcastStatusEnum: () => broadcastStatusEnum,
  broadcastTemplates: () => broadcastTemplates,
  broadcasts: () => broadcasts,
  connectionStatusEnum: () => connectionStatusEnum,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  insertBotBehaviorConfigSchema: () => insertBotBehaviorConfigSchema,
  insertBroadcastContactSchema: () => insertBroadcastContactSchema,
  insertBroadcastSchema: () => insertBroadcastSchema,
  insertBroadcastTemplateSchema: () => insertBroadcastTemplateSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertKnowledgeBaseSchema: () => insertKnowledgeBaseSchema,
  insertLogicConfigSchema: () => insertLogicConfigSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertMessageTemplateSchema: () => insertMessageTemplateSchema,
  insertSystemLogSchema: () => insertSystemLogSchema,
  insertWebAssistantSchema: () => insertWebAssistantSchema,
  insertWhatsappDeviceSchema: () => insertWhatsappDeviceSchema,
  knowledgeBase: () => knowledgeBase,
  knowledgeBaseRelations: () => knowledgeBaseRelations,
  logCategoryEnum: () => logCategoryEnum,
  logLevelEnum: () => logLevelEnum,
  logicConfigs: () => logicConfigs,
  logicConfigsRelations: () => logicConfigsRelations,
  logicTypeEnum: () => logicTypeEnum,
  loginUserSchema: () => loginUserSchema,
  messageDirectionEnum: () => messageDirectionEnum,
  messageTemplates: () => messageTemplates,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  registerUserSchema: () => registerUserSchema,
  sessions: () => sessions,
  systemLogs: () => systemLogs,
  systemLogsRelations: () => systemLogsRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  webAssistants: () => webAssistants,
  webAssistantsRelations: () => webAssistantsRelations,
  whatsappDevices: () => whatsappDevices,
  whatsappDevicesRelations: () => whatsappDevicesRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, registerUserSchema, loginUserSchema, connectionStatusEnum, whatsappDevices, insertWhatsappDeviceSchema, conversations, insertConversationSchema, messageDirectionEnum, messages, insertMessageSchema, logicTypeEnum, logicConfigs, insertLogicConfigSchema, knowledgeBase, insertKnowledgeBaseSchema, botBehaviorConfigs, insertBotBehaviorConfigSchema, broadcastStatusEnum, broadcasts, insertBroadcastSchema, broadcastContacts, insertBroadcastContactSchema, webAssistants, insertWebAssistantSchema, broadcastTemplates, insertBroadcastTemplateSchema, messageTemplates, insertMessageTemplateSchema, usersRelations, whatsappDevicesRelations, conversationsRelations, messagesRelations, webAssistantsRelations, logicConfigsRelations, knowledgeBaseRelations, logCategoryEnum, logLevelEnum, systemLogs, insertSystemLogSchema, systemLogsRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: varchar("username").notNull().unique(),
      passwordHash: varchar("password_hash").notNull(),
      email: varchar("email"),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      // Stripe customer info
      stripeCustomerId: varchar("stripe_customer_id").unique(),
      stripeSubscriptionId: varchar("stripe_subscription_id"),
      // Subscription plan (free, basic, full)
      currentPlan: varchar("current_plan").notNull().default("free"),
      planExpiresAt: timestamp("plan_expires_at"),
      isAdmin: boolean("is_admin").default(false),
      // User's personal Gemini API key
      geminiApiKey: text("gemini_api_key"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    registerUserSchema = z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(6),
      email: z.string().email().optional()
    });
    loginUserSchema = z.object({
      username: z.string(),
      password: z.string()
    });
    connectionStatusEnum = pgEnum("connection_status", ["disconnected", "connecting", "connected", "qr_ready"]);
    whatsappDevices = pgTable("whatsapp_devices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      phoneNumber: varchar("phone_number"),
      connectionStatus: connectionStatusEnum("connection_status").notNull().default("disconnected"),
      qrCode: text("qr_code"),
      lastConnectedAt: timestamp("last_connected_at"),
      activeLogicId: varchar("active_logic_id"),
      isPaused: boolean("is_paused").notNull().default(false),
      shouldTranscribe: boolean("should_transcribe").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertWhatsappDeviceSchema = createInsertSchema(whatsappDevices).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    conversations = pgTable("conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      deviceId: varchar("device_id").notNull().references(() => whatsappDevices.id, { onDelete: "cascade" }),
      contactName: varchar("contact_name").notNull(),
      contactPhone: varchar("contact_phone").notNull(),
      contactProfilePic: text("contact_profile_pic"),
      lastMessageAt: timestamp("last_message_at").defaultNow(),
      unreadCount: integer("unread_count").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertConversationSchema = createInsertSchema(conversations).omit({
      id: true,
      createdAt: true
    });
    messageDirectionEnum = pgEnum("message_direction", ["incoming", "outgoing"]);
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      direction: messageDirectionEnum("direction").notNull(),
      content: text("content").notNull(),
      isFromBot: boolean("is_from_bot").notNull().default(false),
      mediaUrl: text("media_url"),
      mediaType: varchar("media_type"),
      timestamp: timestamp("timestamp").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true,
      timestamp: true
    });
    logicTypeEnum = pgEnum("logic_type", ["json", "ai", "hybrid"]);
    logicConfigs = pgTable("logic_configs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      deviceId: varchar("device_id").references(() => whatsappDevices.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      description: text("description"),
      logicType: logicTypeEnum("logic_type").notNull().default("json"),
      logicJson: jsonb("logic_json").notNull(),
      behaviorConfigId: varchar("behavior_config_id"),
      // Comportamento do bot para AI/Hybrid
      isActive: boolean("is_active").notNull().default(true),
      isTemplate: boolean("is_template").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertLogicConfigSchema = createInsertSchema(logicConfigs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      logicType: z.enum(["json", "ai", "hybrid"]).default("json"),
      // Explicitly require and default to 'json'
      logicJson: z.record(z.any())
    });
    knowledgeBase = pgTable("knowledge_base", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      title: varchar("title").notNull(),
      content: text("content").notNull(),
      category: varchar("category"),
      imageUrls: text("image_urls").array(),
      // Suporte para múltiplas imagens
      tags: text("tags").array(),
      // Tags para busca
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    botBehaviorConfigs = pgTable("bot_behavior_configs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      // Nome do comportamento
      tone: varchar("tone").notNull().default("professional"),
      // formal, friendly, casual, sales, support
      personality: text("personality").notNull(),
      // Descrição da personalidade
      responseStyle: varchar("response_style").notNull().default("concise"),
      // concise, detailed, empathetic
      customInstructions: text("custom_instructions"),
      // Instruções customizadas
      isActive: boolean("is_active").notNull().default(true),
      isPreset: boolean("is_preset").notNull().default(false),
      // Se é comportamento padrão do sistema
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertBotBehaviorConfigSchema = createInsertSchema(botBehaviorConfigs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    broadcastStatusEnum = pgEnum("broadcast_status", ["pending", "running", "paused", "completed", "failed"]);
    broadcasts = pgTable("broadcasts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      deviceId: varchar("device_id").notNull().references(() => whatsappDevices.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      message: text("message").notNull(),
      mediaUrl: text("media_url"),
      // Legacy single media URL
      mediaType: varchar("media_type"),
      // Legacy: image, video, document, audio
      mediaUrls: text("media_urls").array(),
      // New: Array of media URLs
      mediaTypes: text("media_types").array(),
      // New: Array of media types
      status: broadcastStatusEnum("status").notNull().default("pending"),
      totalContacts: integer("total_contacts").notNull().default(0),
      sentCount: integer("sent_count").notNull().default(0),
      failedCount: integer("failed_count").notNull().default(0),
      delay: integer("delay").default(20),
      createdAt: timestamp("created_at").defaultNow(),
      startedAt: timestamp("started_at"),
      completedAt: timestamp("completed_at")
    });
    insertBroadcastSchema = createInsertSchema(broadcasts).omit({
      id: true,
      createdAt: true,
      startedAt: true,
      completedAt: true
    });
    broadcastContacts = pgTable("broadcast_contacts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      broadcastId: varchar("broadcast_id").notNull().references(() => broadcasts.id, { onDelete: "cascade" }),
      contactName: varchar("contact_name").notNull(),
      contactPhone: varchar("contact_phone").notNull(),
      status: varchar("status").notNull().default("pending"),
      // pending, sent, failed
      sentAt: timestamp("sent_at"),
      errorMessage: text("error_message"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertBroadcastContactSchema = createInsertSchema(broadcastContacts).omit({
      id: true,
      createdAt: true
    });
    webAssistants = pgTable("web_assistants", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      slug: varchar("slug").notNull().unique(),
      // Public URL identifier
      themeColor: varchar("theme_color").default("#000000"),
      activeLogicId: varchar("active_logic_id"),
      // Can link to a logic config
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertWebAssistantSchema = createInsertSchema(webAssistants).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    });
    broadcastTemplates = pgTable("broadcast_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      content: text("content").notNull(),
      mediaUrls: text("media_urls").array(),
      // Suporte para múltiplas mídias
      mediaTypes: text("media_types").array(),
      // Tipos correspondentes (image, video, etc)
      createdAt: timestamp("created_at").defaultNow()
    });
    insertBroadcastTemplateSchema = createInsertSchema(broadcastTemplates).omit({
      id: true,
      createdAt: true
    });
    messageTemplates = pgTable("message_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name").notNull(),
      content: text("content").notNull(),
      category: varchar("category"),
      mediaUrls: text("media_urls").array(),
      // Suporte para múltiplas mídias
      mediaTypes: text("media_types").array(),
      // Tipos correspondentes
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    usersRelations = relations(users, ({ many }) => ({
      whatsappDevices: many(whatsappDevices),
      logicConfigs: many(logicConfigs),
      knowledgeBase: many(knowledgeBase),
      webAssistants: many(webAssistants)
    }));
    whatsappDevicesRelations = relations(whatsappDevices, ({ one, many }) => ({
      user: one(users, {
        fields: [whatsappDevices.userId],
        references: [users.id]
      }),
      conversations: many(conversations),
      logicConfigs: many(logicConfigs)
    }));
    conversationsRelations = relations(conversations, ({ one, many }) => ({
      device: one(whatsappDevices, {
        fields: [conversations.deviceId],
        references: [whatsappDevices.id]
      }),
      messages: many(messages)
    }));
    messagesRelations = relations(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      })
    }));
    webAssistantsRelations = relations(webAssistants, ({ one }) => ({
      user: one(users, {
        fields: [webAssistants.userId],
        references: [users.id]
      }),
      activeLogic: one(logicConfigs, {
        fields: [webAssistants.activeLogicId],
        references: [logicConfigs.id]
      })
    }));
    logicConfigsRelations = relations(logicConfigs, ({ one }) => ({
      user: one(users, {
        fields: [logicConfigs.userId],
        references: [users.id]
      }),
      device: one(whatsappDevices, {
        fields: [logicConfigs.deviceId],
        references: [whatsappDevices.id]
      })
    }));
    knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
      user: one(users, {
        fields: [knowledgeBase.userId],
        references: [users.id]
      })
    }));
    logCategoryEnum = pgEnum("log_category", ["whatsapp", "ai", "bot", "system", "broadcast"]);
    logLevelEnum = pgEnum("log_level", ["info", "warning", "error"]);
    systemLogs = pgTable("system_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
      deviceId: varchar("device_id").references(() => whatsappDevices.id, { onDelete: "set null" }),
      category: logCategoryEnum("category").notNull(),
      level: logLevelEnum("level").notNull().default("info"),
      message: text("message").notNull(),
      details: jsonb("details"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSystemLogSchema = createInsertSchema(systemLogs).omit({
      id: true,
      createdAt: true
    });
    systemLogsRelations = relations(systemLogs, ({ one }) => ({
      user: one(users, {
        fields: [systemLogs.userId],
        references: [users.id]
      }),
      device: one(whatsappDevices, {
        fields: [systemLogs.deviceId],
        references: [whatsappDevices.id]
      })
    }));
  }
});

// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, databaseUrl, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pg);
    databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn("\u26A0\uFE0F  DATABASE_URL not set - database functionality may be limited");
    }
    pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
    db = pool ? drizzle(pool, { schema: schema_exports }) : null;
  }
});

// server/storage.ts
import { eq, desc, and, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as fs2 from "fs";
import * as path2 from "path";
var DATA_DIR, DB_FILE, DatabaseStorage, PRESET_BEHAVIORS, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DATA_DIR = path2.join(process.cwd(), "server", "data");
    DB_FILE = path2.join(DATA_DIR, "db.json");
    if (!fs2.existsSync(DATA_DIR)) {
      fs2.mkdirSync(DATA_DIR, { recursive: true });
    }
    DatabaseStorage = class {
      // ... (previous methods)
      // Broadcast Templates
      async getBroadcastTemplates(userId) {
        return await db.select().from(broadcastTemplates).where(eq(broadcastTemplates.userId, userId)).orderBy(desc(broadcastTemplates.createdAt));
      }
      async createBroadcastTemplate(template) {
        const [newTemplate] = await db.insert(broadcastTemplates).values(template).returning();
        return newTemplate;
      }
      async deleteBroadcastTemplate(id) {
        await db.delete(broadcastTemplates).where(eq(broadcastTemplates.id, id));
      }
      // System Logs
      async createSystemLog(log2) {
        const [newLog] = await db.insert(systemLogs).values(log2).returning();
        return newLog;
      }
      async getSystemLogs(filters) {
        let query = db.select().from(systemLogs);
        const conditions = [];
        if (filters?.category) conditions.push(eq(systemLogs.category, filters.category));
        if (filters?.level) conditions.push(eq(systemLogs.level, filters.level));
        if (filters?.deviceId) conditions.push(eq(systemLogs.deviceId, filters.deviceId));
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        return await query.orderBy(desc(systemLogs.createdAt)).limit(filters?.limit || 100);
      }
      async deleteOldSystemLogs(daysToKeep) {
        const cutoff = /* @__PURE__ */ new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);
        await db.delete(systemLogs).where(lt(systemLogs.createdAt, cutoff));
      }
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      async deleteUser(id) {
        await db.delete(users).where(eq(users.id, id));
      }
      async getStats(userId) {
        const userDevices = await this.getDevices(userId);
        const deviceIds = userDevices.map((d) => d.id);
        if (deviceIds.length === 0) {
          return { activeChats: 0, messagesToday: 0, responseRate: 0 };
        }
        const allConversations = await db.select().from(conversations).where(eq(conversations.isActive, true));
        const activeChats = allConversations.filter((c) => deviceIds.includes(c.deviceId)).length;
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const allMessages = await db.select().from(messages);
        const messagesToday = allMessages.filter((m) => {
          const msgDate = new Date(m.timestamp || /* @__PURE__ */ new Date());
          msgDate.setHours(0, 0, 0, 0);
          return msgDate.getTime() === today.getTime();
        }).length;
        const responseRate = activeChats > 0 ? Math.min(95, Math.round(Math.random() * 30 + 70)) : 0;
        return {
          activeChats,
          messagesToday,
          responseRate
        };
      }
      // WhatsApp Devices
      async getDevices(userId) {
        return await db.select().from(whatsappDevices).where(eq(whatsappDevices.userId, userId)).orderBy(desc(whatsappDevices.createdAt));
      }
      async getDevice(id) {
        const [device] = await db.select().from(whatsappDevices).where(eq(whatsappDevices.id, id));
        return device;
      }
      async createDevice(device) {
        const [newDevice] = await db.insert(whatsappDevices).values(device).returning();
        return newDevice;
      }
      async updateDevice(id, data) {
        const [updated] = await db.update(whatsappDevices).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(whatsappDevices.id, id)).returning();
        return updated;
      }
      async deleteDevice(id) {
        await db.delete(whatsappDevices).where(eq(whatsappDevices.id, id));
      }
      // Message Templates
      async createTemplate(template) {
        const id = nanoid();
        const [newTemplate] = await db.insert(messageTemplates).values({ ...template, id }).returning();
        return newTemplate;
      }
      async getTemplates(userId) {
        return await db.select().from(messageTemplates).where(eq(messageTemplates.userId, userId)).orderBy(desc(messageTemplates.createdAt));
      }
      async updateTemplate(id, template) {
        const [updatedTemplate] = await db.update(messageTemplates).set({ ...template, updatedAt: /* @__PURE__ */ new Date() }).where(eq(messageTemplates.id, id)).returning();
        return updatedTemplate;
      }
      async deleteTemplate(id) {
        await db.delete(messageTemplates).where(eq(messageTemplates.id, id));
      }
      async getAllDevices() {
        return await db.select().from(whatsappDevices);
      }
      // Conversations
      async getConversations(deviceId) {
        return await db.select().from(conversations).where(eq(conversations.deviceId, deviceId)).orderBy(desc(conversations.lastMessageAt));
      }
      async getConversation(id) {
        const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
        return conversation;
      }
      async createConversation(conversation) {
        const [newConversation] = await db.insert(conversations).values(conversation).returning();
        return newConversation;
      }
      async updateConversation(id, data) {
        const [updated] = await db.update(conversations).set(data).where(eq(conversations.id, id)).returning();
        return updated;
      }
      // Messages
      async getMessages(conversationId) {
        return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
      }
      async createMessage(message) {
        const [newMessage] = await db.insert(messages).values(message).returning();
        await db.update(conversations).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, message.conversationId));
        return newMessage;
      }
      // Logic Configs
      async getLogics(userId) {
        return await db.select().from(logicConfigs).where(eq(logicConfigs.userId, userId)).orderBy(desc(logicConfigs.createdAt));
      }
      async getLogic(id) {
        const [logic] = await db.select().from(logicConfigs).where(eq(logicConfigs.id, id));
        return logic;
      }
      async createLogic(logic) {
        const [newLogic] = await db.insert(logicConfigs).values(logic).returning();
        return newLogic;
      }
      async updateLogic(id, data) {
        const [updated] = await db.update(logicConfigs).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(logicConfigs.id, id)).returning();
        return updated;
      }
      async deleteLogic(id) {
        await db.delete(logicConfigs).where(eq(logicConfigs.id, id));
      }
      // Knowledge Base
      async getKnowledgeBase(userId) {
        return await db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId)).orderBy(desc(knowledgeBase.createdAt));
      }
      async getKnowledgeBaseItem(id) {
        const [item] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
        return item;
      }
      async createKnowledgeBase(kb) {
        const [newKb] = await db.insert(knowledgeBase).values(kb).returning();
        return newKb;
      }
      async updateKnowledgeBase(id, data) {
        const [updated] = await db.update(knowledgeBase).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(knowledgeBase.id, id)).returning();
        return updated;
      }
      async deleteKnowledgeBase(id) {
        await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
      }
      // Bot Behavior Configs
      async getBotBehaviors(userId) {
        return await db.select().from(botBehaviorConfigs).where(eq(botBehaviorConfigs.userId, userId)).orderBy(desc(botBehaviorConfigs.createdAt));
      }
      async getBotBehavior(id) {
        const [behavior] = await db.select().from(botBehaviorConfigs).where(eq(botBehaviorConfigs.id, id));
        return behavior;
      }
      async createBotBehavior(behavior) {
        const [newBehavior] = await db.insert(botBehaviorConfigs).values(behavior).returning();
        return newBehavior;
      }
      async updateBotBehavior(id, data) {
        const [updated] = await db.update(botBehaviorConfigs).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(botBehaviorConfigs.id, id)).returning();
        return updated;
      }
      async deleteBotBehavior(id) {
        await db.delete(botBehaviorConfigs).where(eq(botBehaviorConfigs.id, id));
      }
      async getPresetBehaviors() {
        const dbPresets = await db.select().from(botBehaviorConfigs).where(eq(botBehaviorConfigs.isPreset, true));
        if (dbPresets.length === 0) {
          return PRESET_BEHAVIORS;
        }
        return dbPresets;
      }
      // Stats
      // User update operations
      async updateUser(id, data) {
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return updated;
      }
      async upsertUser(user) {
        const existing = await this.getUser(user.id);
        if (existing) {
          return await this.updateUser(user.id, user);
        } else {
          const [newUser] = await db.insert(users).values(user).returning();
          return newUser;
        }
      }
      // Broadcast operations
      async getBroadcasts(userId) {
        return await db.select().from(broadcasts).where(eq(broadcasts.userId, userId)).orderBy(desc(broadcasts.createdAt));
      }
      async getBroadcast(id) {
        const [broadcast] = await db.select().from(broadcasts).where(eq(broadcasts.id, id));
        return broadcast;
      }
      async createBroadcast(data) {
        const [broadcast] = await db.insert(broadcasts).values(data).returning();
        return broadcast;
      }
      async updateBroadcast(id, data) {
        const [updated] = await db.update(broadcasts).set(data).where(eq(broadcasts.id, id)).returning();
        return updated;
      }
      async deleteBroadcast(id) {
        await db.delete(broadcasts).where(eq(broadcasts.id, id));
      }
      async getAllScheduledBroadcasts() {
        return await db.select().from(broadcasts).where(eq(broadcasts.status, "pending"));
      }
      async getBroadcastContacts(broadcastId) {
        return await db.select().from(broadcastContacts).where(eq(broadcastContacts.broadcastId, broadcastId));
      }
      async createBroadcastContact(data) {
        const [contact] = await db.insert(broadcastContacts).values(data).returning();
        return contact;
      }
      async updateBroadcastContact(id, data) {
        const [updated] = await db.update(broadcastContacts).set(data).where(eq(broadcastContacts.id, id)).returning();
        return updated;
      }
      // Web Assistant methods
      async getWebAssistants(userId) {
        return await db.select().from(webAssistants).where(eq(webAssistants.userId, userId)).orderBy(desc(webAssistants.createdAt));
      }
      async getWebAssistant(id) {
        const [assistant] = await db.select().from(webAssistants).where(eq(webAssistants.id, id));
        return assistant;
      }
      async getWebAssistantBySlug(slug) {
        const [assistant] = await db.select().from(webAssistants).where(eq(webAssistants.slug, slug));
        return assistant;
      }
      async createWebAssistant(assistant) {
        const [newAssistant] = await db.insert(webAssistants).values(assistant).returning();
        return newAssistant;
      }
      async updateWebAssistant(id, data) {
        const [updated] = await db.update(webAssistants).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(webAssistants.id, id)).returning();
        return updated;
      }
      async deleteWebAssistant(id) {
        await db.delete(webAssistants).where(eq(webAssistants.id, id));
      }
    };
    PRESET_BEHAVIORS = [
      {
        id: "preset-professional",
        userId: "system",
        name: "Profissional",
        tone: "formal",
        personality: "Sou um assistente profissional e cort\uFFFDs. Falo de forma clara e objetiva, sempre mantendo respeito e formalidade.",
        responseStyle: "concise",
        customInstructions: "Use linguagem formal. Sempre cumprimente educadamente.",
        isActive: true,
        isPreset: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "preset-friendly",
        userId: "system",
        name: "Amig\uFFFDvel",
        tone: "friendly",
        personality: "Sou um assistente amig\uFFFDvel e acolhedor. Converso de forma calorosa e emp\uFFFDtica, criando conex\uFFFDo genu\uFFFDna.",
        responseStyle: "detailed",
        customInstructions: "Use tom amig\uFFFDvel. Mostre empatia e interesse genu\uFFFDno.",
        isActive: true,
        isPreset: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "preset-sales",
        userId: "system",
        name: "Vendas",
        tone: "persuasive",
        personality: "Sou um assistente de vendas consultivo. Identifico necessidades e apresento solu\uFFFD\uFFFDes de forma persuasiva mas n\uFFFDo invasiva.",
        responseStyle: "detailed",
        customInstructions: "Foque em benef\uFFFDcios. Fa\uFFFDa perguntas qualificadoras. Conduza para convers\uFFFDo.",
        isActive: true,
        isPreset: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "preset-support",
        userId: "system",
        name: "Suporte T\uFFFDcnico",
        tone: "empathetic",
        personality: "Sou um assistente de suporte t\uFFFDcnico prestativo. Resolvo problemas de forma clara, paciente e did\uFFFDtica.",
        responseStyle: "detailed",
        customInstructions: "Seja paciente. Explique passo a passo. Confirme resolu\uFFFD\uFFFDo do problema.",
        isActive: true,
        isPreset: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    MemStorage = class {
      users = /* @__PURE__ */ new Map();
      devices = /* @__PURE__ */ new Map();
      conversations = /* @__PURE__ */ new Map();
      messages = /* @__PURE__ */ new Map();
      logics = /* @__PURE__ */ new Map();
      knowledgeBases = /* @__PURE__ */ new Map();
      botBehaviors = /* @__PURE__ */ new Map();
      broadcasts = /* @__PURE__ */ new Map();
      broadcastContacts = /* @__PURE__ */ new Map();
      broadcastTemplates = /* @__PURE__ */ new Map();
      messageTemplates = /* @__PURE__ */ new Map();
      webAssistants = /* @__PURE__ */ new Map();
      systemLogs = /* @__PURE__ */ new Map();
      constructor() {
        this.loadData();
        PRESET_BEHAVIORS.forEach((preset) => {
          if (!this.botBehaviors.has(preset.id)) {
            this.botBehaviors.set(preset.id, preset);
          }
        });
        this.saveData();
      }
      loadData() {
        try {
          if (fs2.existsSync(DB_FILE)) {
            const data = JSON.parse(fs2.readFileSync(DB_FILE, "utf8"));
            const revive = (obj) => {
              for (const key in obj) {
                if (typeof obj[key] === "string" && /^\d{4}-\d{2}-\d{2}T/.test(obj[key])) {
                  obj[key] = new Date(obj[key]);
                }
              }
              return obj;
            };
            if (data.users) this.users = new Map(data.users.map((u) => [u.id, revive(u)]));
            if (data.devices) this.devices = new Map(data.devices.map((d) => [d.id, revive(d)]));
            if (data.conversations) this.conversations = new Map(data.conversations.map((c) => [c.id, revive(c)]));
            if (data.messages) this.messages = new Map(data.messages.map((m) => [m.id, revive(m)]));
            if (data.logics) this.logics = new Map(data.logics.map((l) => [l.id, revive(l)]));
            if (data.knowledgeBases) this.knowledgeBases = new Map(data.knowledgeBases.map((k) => [k.id, revive(k)]));
            if (data.botBehaviors) this.botBehaviors = new Map(data.botBehaviors.map((b) => [b.id, revive(b)]));
            if (data.webAssistants) this.webAssistants = new Map(data.webAssistants.map((w) => [w.id, revive(w)]));
            if (data.broadcasts) this.broadcasts = new Map(data.broadcasts.map((b) => [b.id, revive(b)]));
            if (data.broadcastContacts) this.broadcastContacts = new Map(data.broadcastContacts.map((c) => [c.id, revive(c)]));
            if (data.broadcastTemplates) this.broadcastTemplates = new Map(data.broadcastTemplates.map((t) => [t.id, revive(t)]));
            if (data.messageTemplates) this.messageTemplates = new Map(data.messageTemplates.map((t) => [t.id, revive(t)]));
            if (data.systemLogs) this.systemLogs = new Map(data.systemLogs.map((l) => [l.id, revive(l)]));
            console.log(`[Storage] Data loaded from ${DB_FILE}`);
          }
        } catch (error) {
          console.error("[Storage] Error loading data:", error);
        }
      }
      saveData() {
        try {
          const data = {
            users: Array.from(this.users.values()),
            devices: Array.from(this.devices.values()),
            conversations: Array.from(this.conversations.values()),
            messages: Array.from(this.messages.values()),
            logics: Array.from(this.logics.values()),
            knowledgeBases: Array.from(this.knowledgeBases.values()),
            botBehaviors: Array.from(this.botBehaviors.values()),
            broadcasts: Array.from(this.broadcasts.values()),
            broadcastContacts: Array.from(this.broadcastContacts.values()),
            webAssistants: Array.from(this.webAssistants.values()),
            broadcastTemplates: Array.from(this.broadcastTemplates.values()),
            messageTemplates: Array.from(this.messageTemplates.values()),
            systemLogs: Array.from(this.systemLogs.values())
          };
          fs2.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
        } catch (error) {
          console.error("[Storage] Error saving data:", error);
        }
      }
      // User operations
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find((u) => u.username === username);
      }
      async createUser(userData) {
        const user = {
          ...userData,
          id: nanoid(),
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          geminiApiKey: userData.geminiApiKey || null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPlan: userData.currentPlan || "free",
          planExpiresAt: userData.planExpiresAt || null,
          isAdmin: userData.isAdmin || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.users.set(user.id, user);
        this.saveData();
        return user;
      }
      async updateUser(id, data) {
        const user = this.users.get(id);
        if (!user) throw new Error("User not found");
        const updated = { ...user, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.users.set(id, updated);
        this.saveData();
        return updated;
      }
      async upsertUser(userData) {
        this.users.set(userData.id, userData);
        this.saveData();
        return userData;
      }
      async getAllUsers() {
        return Array.from(this.users.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async deleteUser(id) {
        this.users.delete(id);
        this.saveData();
      }
      // WhatsApp Devices
      async getDevices(userId) {
        return Array.from(this.devices.values()).filter((d) => d.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getDevice(id) {
        return this.devices.get(id);
      }
      async createDevice(device) {
        const newDevice = {
          ...device,
          id: nanoid(),
          phoneNumber: device.phoneNumber || null,
          connectionStatus: device.connectionStatus || "disconnected",
          qrCode: null,
          lastConnectedAt: null,
          activeLogicId: null,
          isPaused: false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.devices.set(newDevice.id, newDevice);
        this.saveData();
        return newDevice;
      }
      async updateDevice(id, data) {
        const device = this.devices.get(id);
        if (!device) throw new Error("Device not found");
        const updated = { ...device, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.devices.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteDevice(id) {
        this.devices.delete(id);
        this.saveData();
      }
      async getAllDevices() {
        return Array.from(this.devices.values());
      }
      // Conversations
      async getConversations(deviceId) {
        return Array.from(this.conversations.values()).filter((c) => c.deviceId === deviceId).sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
      }
      async getConversation(id) {
        return this.conversations.get(id);
      }
      async createConversation(conversation) {
        const newConv = {
          ...conversation,
          id: nanoid(),
          lastMessageAt: /* @__PURE__ */ new Date(),
          unreadCount: conversation.unreadCount || 0,
          isActive: conversation.isActive !== void 0 ? conversation.isActive : true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.conversations.set(newConv.id, newConv);
        this.saveData();
        return newConv;
      }
      async updateConversation(id, data) {
        const conv = this.conversations.get(id);
        if (!conv) throw new Error("Conversation not found");
        const updated = { ...conv, ...data };
        this.conversations.set(id, updated);
        this.saveData();
        return updated;
      }
      // Messages
      async getMessages(conversationId) {
        return Array.from(this.messages.values()).filter((m) => m.conversationId === conversationId).sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
      }
      async createMessage(message) {
        const newMessage = {
          ...message,
          id: nanoid(),
          isFromBot: message.isFromBot || false,
          timestamp: /* @__PURE__ */ new Date(),
          createdAt: /* @__PURE__ */ new Date()
        };
        this.messages.set(newMessage.id, newMessage);
        const conv = this.conversations.get(message.conversationId);
        if (conv) {
          conv.lastMessageAt = /* @__PURE__ */ new Date();
          this.conversations.set(message.conversationId, conv);
        }
        this.saveData();
        return newMessage;
      }
      // Logic Configs
      async getLogics(userId) {
        return Array.from(this.logics.values()).filter((l) => l.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getLogic(id) {
        return this.logics.get(id);
      }
      async createLogic(logic) {
        const newLogic = {
          ...logic,
          id: nanoid(),
          deviceId: logic.deviceId || null,
          description: logic.description || null,
          logicType: logic.logicType || "json",
          behaviorConfigId: null,
          isActive: logic.isActive !== void 0 ? logic.isActive : true,
          isTemplate: logic.isTemplate || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.logics.set(newLogic.id, newLogic);
        this.saveData();
        return newLogic;
      }
      async updateLogic(id, data) {
        const logic = this.logics.get(id);
        if (!logic) throw new Error("Logic not found");
        const updated = { ...logic, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.logics.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteLogic(id) {
        this.logics.delete(id);
        this.saveData();
      }
      // Knowledge Base
      async getKnowledgeBase(userId) {
        return Array.from(this.knowledgeBases.values()).filter((kb) => kb.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getKnowledgeBaseItem(id) {
        return this.knowledgeBases.get(id);
      }
      async createKnowledgeBase(kb) {
        const newKb = {
          ...kb,
          id: nanoid(),
          category: kb.category || null,
          imageUrls: kb.imageUrls || null,
          tags: kb.tags || null,
          isActive: kb.isActive !== void 0 ? kb.isActive : true,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.knowledgeBases.set(newKb.id, newKb);
        this.saveData();
        return newKb;
      }
      async updateKnowledgeBase(id, data) {
        const kb = this.knowledgeBases.get(id);
        if (!kb) throw new Error("Knowledge Base item not found");
        const updated = { ...kb, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.knowledgeBases.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteKnowledgeBase(id) {
        this.knowledgeBases.delete(id);
        this.saveData();
      }
      // Bot Behavior Configs
      async getBotBehaviors(userId) {
        return Array.from(this.botBehaviors.values()).filter((b) => b.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getBotBehavior(id) {
        return this.botBehaviors.get(id);
      }
      async createBotBehavior(behavior) {
        const newBehavior = {
          ...behavior,
          id: nanoid(),
          tone: behavior.tone || "professional",
          responseStyle: behavior.responseStyle || "concise",
          customInstructions: behavior.customInstructions || null,
          isActive: behavior.isActive !== void 0 ? behavior.isActive : true,
          isPreset: behavior.isPreset || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.botBehaviors.set(newBehavior.id, newBehavior);
        this.saveData();
        return newBehavior;
      }
      async updateBotBehavior(id, data) {
        const behavior = this.botBehaviors.get(id);
        if (!behavior) throw new Error("Bot Behavior not found");
        const updated = { ...behavior, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.botBehaviors.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteBotBehavior(id) {
        this.botBehaviors.delete(id);
        this.saveData();
      }
      async getPresetBehaviors() {
        return Array.from(this.botBehaviors.values()).filter((b) => b.isPreset);
      }
      // Stats
      async getStats(userId) {
        const userDevices = await this.getDevices(userId);
        const deviceIds = userDevices.map((d) => d.id);
        if (deviceIds.length === 0) {
          return { activeChats: 0, messagesToday: 0, responseRate: 0 };
        }
        const activeChats = Array.from(this.conversations.values()).filter((c) => c.isActive && deviceIds.includes(c.deviceId)).length;
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const messagesToday = Array.from(this.messages.values()).filter((m) => {
          const conv = this.conversations.get(m.conversationId);
          return conv && deviceIds.includes(conv.deviceId) && m.timestamp && m.timestamp >= today;
        }).length;
        const responseRate = activeChats > 0 ? Math.min(95, Math.round(Math.random() * 30 + 70)) : 0;
        return { activeChats, messagesToday, responseRate };
      }
      // ============ BROADCAST METHODS ============
      async getBroadcasts(userId) {
        return Array.from(this.broadcasts.values()).filter((b) => b.userId === userId);
      }
      async getBroadcast(id) {
        return this.broadcasts.get(id);
      }
      async createBroadcast(data) {
        const newBroadcast = { ...data, id: nanoid(), createdAt: /* @__PURE__ */ new Date(), startedAt: null, completedAt: null };
        this.broadcasts.set(newBroadcast.id, newBroadcast);
        this.saveData();
        return newBroadcast;
      }
      async updateBroadcast(id, data) {
        const b = this.broadcasts.get(id);
        if (!b) throw new Error("Broadcast not found");
        const updated = { ...b, ...data };
        this.broadcasts.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteBroadcast(id) {
        this.broadcasts.delete(id);
        this.saveData();
      }
      async getBroadcastContacts(broadcastId) {
        return Array.from(this.broadcastContacts.values()).filter((c) => c.broadcastId === broadcastId);
      }
      async createBroadcastContact(data) {
        const newContact = { ...data, id: nanoid(), createdAt: /* @__PURE__ */ new Date(), sentAt: null, errorMessage: null };
        this.broadcastContacts.set(newContact.id, newContact);
        this.saveData();
        return newContact;
      }
      async updateBroadcastContact(id, data) {
        const contact = this.broadcastContacts.get(id);
        if (!contact) throw new Error("Broadcast contact not found");
        const updated = { ...contact, ...data };
        this.broadcastContacts.set(id, updated);
        this.saveData();
        return updated;
      }
      async getAllScheduledBroadcasts() {
        return Array.from(this.broadcasts.values()).filter((b) => b.status === "pending" && b.scheduledFor);
      }
      // Web Assistant methods
      async getWebAssistants(userId) {
        return Array.from(this.webAssistants.values()).filter(
          (w) => w.userId === userId
        );
      }
      async getWebAssistant(id) {
        return this.webAssistants.get(id);
      }
      async getWebAssistantBySlug(slug) {
        return Array.from(this.webAssistants.values()).find(
          (w) => w.slug === slug
        );
      }
      async createWebAssistant(assistant) {
        const id = nanoid();
        const newAssistant = {
          ...assistant,
          id,
          themeColor: assistant.themeColor || "#000000",
          activeLogicId: assistant.activeLogicId || null,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.webAssistants.set(id, newAssistant);
        this.saveData();
        return newAssistant;
      }
      async updateWebAssistant(id, data) {
        const assistant = this.webAssistants.get(id);
        if (!assistant) throw new Error("Web assistant not found");
        const updated = { ...assistant, ...data, updatedAt: /* @__PURE__ */ new Date() };
        this.webAssistants.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteWebAssistant(id) {
        this.webAssistants.delete(id);
        this.saveData();
      }
      // Broadcast Templates
      async getBroadcastTemplates(userId) {
        return Array.from(this.broadcastTemplates.values()).filter((t) => t.userId === userId);
      }
      async createBroadcastTemplate(template) {
        const id = nanoid();
        const newTemplate = {
          ...template,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.broadcastTemplates.set(id, newTemplate);
        this.saveData();
        return newTemplate;
      }
      async deleteBroadcastTemplate(id) {
        this.broadcastTemplates.delete(id);
        this.saveData();
      }
      // Message Templates
      async createTemplate(template) {
        const id = nanoid();
        const newTemplate = {
          ...template,
          id,
          category: template.category || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.messageTemplates.set(id, newTemplate);
        this.saveData();
        return newTemplate;
      }
      async getTemplates(userId) {
        return Array.from(this.messageTemplates.values()).filter((t) => t.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async updateTemplate(id, template) {
        const existing = this.messageTemplates.get(id);
        if (!existing) throw new Error("Template not found");
        const updated = {
          ...existing,
          ...template,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.messageTemplates.set(id, updated);
        this.saveData();
        return updated;
      }
      async deleteTemplate(id) {
        this.messageTemplates.delete(id);
        this.saveData();
      }
      // System Logs
      async createSystemLog(log2) {
        const id = nanoid();
        const newLog = {
          ...log2,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          userId: log2.userId || null,
          deviceId: log2.deviceId || null,
          details: log2.details || null,
          level: log2.level || "info"
        };
        this.systemLogs.set(id, newLog);
        this.saveData();
        return newLog;
      }
      async getSystemLogs(filters) {
        let logs = Array.from(this.systemLogs.values());
        if (filters) {
          if (filters.category) logs = logs.filter((l) => l.category === filters.category);
          if (filters.level) logs = logs.filter((l) => l.level === filters.level);
          if (filters.deviceId) logs = logs.filter((l) => l.deviceId === filters.deviceId);
        }
        return logs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, filters?.limit || 100);
      }
      async deleteOldSystemLogs(daysToKeep) {
        const cutoff = /* @__PURE__ */ new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);
        for (const [id, log2] of Array.from(this.systemLogs.entries())) {
          if (log2.createdAt && log2.createdAt < cutoff) {
            this.systemLogs.delete(id);
          }
        }
        this.saveData();
      }
    };
    storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
  }
});

// server/logicExecutor.ts
function normalizeText(text2) {
  return text2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function executeLogic(messageContent, logicJson) {
  const normalizedMessage = normalizeText(messageContent);
  if (!logicJson || typeof logicJson !== "object") {
    console.error("[LogicExecutor] Invalid logicJson: not an object", logicJson);
    return {
      reply: "Erro: L\xF3gica inv\xE1lida configurada.",
      shouldPause: false
    };
  }
  if (!Array.isArray(logicJson.rules)) {
    console.error("[LogicExecutor] Invalid logicJson.rules: not an array", logicJson);
    return {
      reply: logicJson.default_reply || "Erro: L\xF3gica mal configurada.",
      shouldPause: logicJson.pause_bot_after_reply ?? false
    };
  }
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;
    const exactMatch = rule.keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedMessage === normalizedKeyword;
    });
    if (exactMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state
      };
    }
  }
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;
    const wordMatch = rule.keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      const regex = new RegExp(`\\b${normalizedKeyword}\\b`, "i");
      return regex.test(normalizedMessage);
    });
    if (wordMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state
      };
    }
  }
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;
    const partialMatch = rule.keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedMessage.includes(normalizedKeyword);
    });
    if (partialMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state
      };
    }
  }
  return {
    reply: logicJson.default_reply || "Desculpe, n\xE3o entendi sua mensagem.",
    shouldPause: logicJson.pause_bot_after_reply ?? false
  };
}
var init_logicExecutor = __esm({
  "server/logicExecutor.ts"() {
    "use strict";
  }
});

// server/logManager.ts
async function logSystemEvent(category, level, message, details, userId, deviceId) {
  try {
    const logData = {
      category,
      level,
      message,
      details: details || null,
      userId: userId || null,
      deviceId: deviceId || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const validatedLog = insertSystemLogSchema.parse(logData);
    await storage.createSystemLog(validatedLog);
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const prefix = `[${timestamp2}] [${category.toUpperCase()}] [${level.toUpperCase()}]`;
    const consoleMethod = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
    consoleMethod(`${prefix} ${message}`, details ? JSON.stringify(details) : "");
  } catch (error) {
    console.error(`[SYSTEM_LOG_FAILURE] Failed to log event: ${message}`, error);
  }
}
var init_logManager = __esm({
  "server/logManager.ts"() {
    "use strict";
    init_storage();
    init_schema();
  }
});

// server/whatsappManager.ts
var whatsappManager_exports = {};
__export(whatsappManager_exports, {
  MessageMedia: () => MessageMedia,
  cleanupOrphanSessions: () => cleanupOrphanSessions,
  createWhatsAppSession: () => createWhatsAppSession,
  destroyWhatsAppSession: () => destroyWhatsAppSession,
  forceCleanupSession: () => forceCleanupSession,
  getActiveSessionCount: () => getActiveSessionCount,
  getAllSessionsInfo: () => getAllSessionsInfo,
  getClient: () => getClient,
  getContactProfilePic: () => getContactProfilePic,
  getWhatsAppContacts: () => getWhatsAppContacts,
  getWhatsAppQRCode: () => getWhatsAppQRCode,
  getWhatsAppSessionStatus: () => getWhatsAppSessionStatus,
  markDeviceActivity: () => markDeviceActivity,
  restoreWhatsAppSessions: () => restoreWhatsAppSessions,
  sendWhatsAppMessage: () => sendWhatsAppMessage,
  startDeviceSession: () => startDeviceSession,
  stopDeviceSession: () => stopDeviceSession,
  syncContacts: () => syncContacts
});
import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import * as fs3 from "fs";
import * as path3 from "path";
import { GoogleGenAI } from "@google/genai";
function getAI() {
  if (aiInstance) return aiInstance;
  let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    try {
      const envPath2 = path3.resolve(process.cwd(), ".env");
      if (fs3.existsSync(envPath2)) {
        const envContent = fs3.readFileSync(envPath2, "utf8");
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
          geminiKey = match[1].trim();
          process.env.GEMINI_API_KEY = geminiKey;
          console.log("[Gemini] Loaded API Key from .env file fallback");
        }
      }
    } catch (err) {
      console.error("[Gemini] Failed to read .env file fallback:", err);
    }
  }
  if (geminiKey) {
    aiInstance = new GoogleGenAI({ apiKey: geminiKey });
  } else {
    console.error("[Gemini] API Key not found in environment or .env file");
  }
  return aiInstance;
}
async function saveMessageToDb(deviceId, contactNumber, content, direction, isFromBot = false, mediaUrl, mediaType) {
  console.log(`[DB Debug] Saving message for device ${deviceId}, contact ${contactNumber}`);
  try {
    const conversations2 = await storage.getConversations(deviceId);
    let conversation = conversations2.find((c) => c.contactPhone === contactNumber);
    if (!conversation) {
      console.log(`[DB Debug] Creating new conversation for ${contactNumber}`);
      conversation = await storage.createConversation({
        deviceId,
        contactName: contactNumber,
        // Default name to number initially
        contactPhone: contactNumber,
        isActive: true,
        unreadCount: 0
      });
      console.log(`[DB Debug] Conversation created with ID: ${conversation.id}`);
    } else {
      console.log(`[DB Debug] Found existing conversation ID: ${conversation.id}`);
    }
    await storage.createMessage({
      conversationId: conversation.id,
      direction,
      content,
      isFromBot,
      mediaUrl,
      mediaType
    });
    console.log(`[DB Debug] Message saved successfully`);
  } catch (error) {
    console.error(`[WhatsApp] Error saving message to DB:`, error);
  }
}
async function createWhatsAppSession(deviceId) {
  const startTime = Date.now();
  console.log(`[WhatsApp] \u23F1\uFE0F Starting session creation for device: ${deviceId} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  await logSystemEvent("whatsapp", "info", "Iniciando processo de conex\xE3o...", null, void 0, deviceId);
  if (sessions2.has(deviceId)) {
    const existingSession = sessions2.get(deviceId);
    if (existingSession.status !== "DISCONNECTED" && existingSession.status !== "DESTROYING") {
      console.log(`[WhatsApp] Session already exists for device: ${deviceId}`);
      return;
    }
    await destroyWhatsAppSession(deviceId);
  }
  const puppeteerConfig = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-component-extensions-with-background-pages",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-features=TranslateUI",
      "--disable-hang-monitor",
      "--disable-ipc-flooding-protection",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-sync",
      "--enable-features=NetworkService,NetworkServiceInProcess",
      "--force-color-profile=srgb",
      "--metrics-recording-only",
      "--no-default-browser-check",
      "--password-store=basic",
      "--use-mock-keychain",
      "--js-flags=--max-old-space-size=512",
      "--disable-setuid-sandbox",
      "--disable-web-security"
    ],
    timeout: 12e4
    // 2 minutes browser launch timeout
  };
  if (process.env.NODE_ENV === "production" || process.platform === "linux") {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (fs3.existsSync("/usr/bin/chromium-browser")) {
      puppeteerConfig.executablePath = "/usr/bin/chromium-browser";
    } else if (fs3.existsSync("/usr/bin/chromium")) {
      puppeteerConfig.executablePath = "/usr/bin/chromium";
    } else if (fs3.existsSync("/usr/bin/google-chrome-stable")) {
      puppeteerConfig.executablePath = "/usr/bin/google-chrome-stable";
    }
  }
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: deviceId }),
    puppeteer: puppeteerConfig,
    webVersionCache: {
      type: "remote",
      remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html"
    }
  });
  const session2 = {
    client,
    status: "INITIALIZING",
    qrCode: null,
    deviceId,
    createdAt: /* @__PURE__ */ new Date(),
    retryCount: 0
  };
  sessions2.set(deviceId, session2);
  pausedChats.set(deviceId, []);
  client.on("qr", (qr) => {
    console.log(`[WhatsApp] \u23F1\uFE0F QR Code generated for device: ${deviceId} (Length: ${qr.length}) at ${(/* @__PURE__ */ new Date()).toISOString()}`);
    logSystemEvent("whatsapp", "warning", "QR Code gerado. Aguardando leitura...", { qrLength: qr.length }, void 0, deviceId);
    session2.status = "QR_PENDING";
    qrcode.toDataURL(qr, async (err, url) => {
      if (!err && url) {
        session2.qrCode = url;
        await storage.updateDevice(deviceId, { connectionStatus: "qr_ready", qrCode: url });
      }
    });
  });
  client.on("ready", async () => {
    console.log(`[WhatsApp] Client ready for device: ${deviceId}`);
    await logSystemEvent("whatsapp", "info", "Conex\xE3o estabelecida com sucesso!", null, void 0, deviceId);
    session2.status = "READY";
    session2.qrCode = null;
    await storage.updateDevice(deviceId, { connectionStatus: "connected", qrCode: null, lastConnectedAt: /* @__PURE__ */ new Date() });
  });
  client.on("authenticated", () => {
    console.log(`[WhatsApp] Client authenticated for device: ${deviceId}`);
    session2.retryCount = 0;
  });
  client.on("auth_failure", async (msg) => {
    console.error(`[WhatsApp] Auth failure for device ${deviceId}:`, msg);
    await logSystemEvent("whatsapp", "error", `Falha de autentica\xE7\xE3o: ${msg}`, { error: msg }, void 0, deviceId);
    session2.status = "AUTH_FAILURE";
    try {
      const sessionPath = path3.join(process.cwd(), ".wwebjs_auth", `session-${deviceId}`);
      if (fs3.existsSync(sessionPath)) {
        fs3.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`[WhatsApp] Cleared corrupted session for device: ${deviceId}`);
      }
    } catch (cleanupErr) {
      console.error(`[WhatsApp] Error cleaning session:`, cleanupErr);
    }
    await storage.updateDevice(deviceId, { connectionStatus: "disconnected", qrCode: null });
    setTimeout(async () => {
      console.log(`[WhatsApp] Retrying connection after auth failure for: ${deviceId}`);
      await destroyWhatsAppSession(deviceId);
      await createWhatsAppSession(deviceId);
    }, 5e3);
  });
  client.on("disconnected", async (reason) => {
    if (session2.status !== "DESTROYING") {
      console.warn(`[WhatsApp] Client disconnected for device: ${deviceId}, reason:`, reason);
      await logSystemEvent("whatsapp", "error", `WhatsApp desconectado: ${reason}`, { reason }, void 0, deviceId);
      session2.status = "DISCONNECTED";
      await storage.updateDevice(deviceId, { connectionStatus: "disconnected" });
      const currentSession = sessions2.get(deviceId);
      if (currentSession) {
        const retryCount = currentSession.retryCount;
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
          console.log(`[WhatsApp] Auto-reconnecting device ${deviceId} in ${delay / 1e3}s (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(async () => {
            if (sessions2.has(deviceId) && sessions2.get(deviceId).status === "DISCONNECTED") {
              console.log(`[WhatsApp] Executing reconnection attempt ${retryCount + 1} for device: ${deviceId}`);
              await destroyWhatsAppSession(deviceId);
              await createWhatsAppSession(deviceId);
              const newSession = sessions2.get(deviceId);
              if (newSession) {
                newSession.retryCount = retryCount + 1;
              }
            }
          }, delay);
        } else {
          console.error(`[WhatsApp] Max retries (${MAX_RETRIES}) reached for device: ${deviceId}. Manual intervention required.`);
          await logSystemEvent("whatsapp", "error", `M\xE1ximo de tentativas atingido. Reconex\xE3o manual necess\xE1ria.`, { retryCount }, void 0, deviceId);
        }
      }
    }
  });
  client.on("loading_screen", (percent, message) => {
    console.log(`[WhatsApp] Loading screen for device ${deviceId}: ${percent}% - ${message}`);
  });
  client.on("message", async (message) => {
    const userNumber = message.from;
    try {
      if (userNumber.endsWith("@g.us") || message.isStatus) {
        return;
      }
      if (message.fromMe) {
        console.log(`[WhatsApp] Ignoring own message from device: ${deviceId}`);
        return;
      }
      const otherBotJids = [];
      for (const [sId, sess] of Array.from(sessions2.entries())) {
        if (sId !== deviceId && sess.status === "READY" && sess.client.info) {
          otherBotJids.push(sess.client.info.wid._serialized);
        }
      }
      if (otherBotJids.includes(message.from)) {
        console.log(`[WhatsApp] [Anti-Loop] Ignoring message from bot ${message.from}`);
        return;
      }
      let messageBody = message.body;
      let mediaUrl;
      let mediaType;
      if (message.hasMedia) {
        try {
          console.log(`[WhatsApp] Downloading media from ${userNumber}...`);
          const media = await message.downloadMedia();
          if (media) {
            const UPLOADS_DIR = path3.join(process.cwd(), "uploads");
            if (!fs3.existsSync(UPLOADS_DIR)) {
              fs3.mkdirSync(UPLOADS_DIR, { recursive: true });
            }
            const filename = `${message.id.id}.${media.mimetype.split("/")[1].split(";")[0]}`;
            const filepath = path3.join(UPLOADS_DIR, filename);
            fs3.writeFileSync(filepath, media.data, "base64");
            mediaUrl = `/uploads/${filename}`;
            mediaType = media.mimetype;
            const device2 = await storage.getDevice(deviceId);
            const shouldTranscribe = device2?.shouldTranscribe ?? true;
            let aiText = "";
            if (shouldTranscribe) {
              const ai = getAI();
              if (ai) {
                console.log(`[WhatsApp] Processing media with Gemini (${media.mimetype})...`);
                await logSystemEvent("ai", "info", "Analisando m\xEDdia com IA...", { mimetype: media.mimetype }, void 0, deviceId);
                let prompt = "Descreva esta imagem em detalhes.";
                if (media.mimetype.startsWith("audio")) {
                  prompt = "Transcreva este \xE1udio fielmente. Retorne apenas a transcri\xE7\xE3o.";
                } else if (media.mimetype.startsWith("image")) {
                  prompt = "Descreva esta imagem em detalhes. Se tiver texto, transcreva-o tamb\xE9m.";
                }
                const result = await ai.models.generateContent({
                  model: "gemini-2.0-flash-exp",
                  contents: [
                    {
                      role: "user",
                      parts: [
                        { text: prompt },
                        {
                          inlineData: {
                            mimeType: media.mimetype,
                            data: media.data
                          }
                        }
                      ]
                    }
                  ]
                });
                aiText = result.text || "";
                console.log(`[WhatsApp] AI Media Analysis: ${aiText}`);
              }
            } else {
              console.log(`[WhatsApp] Skipping AI transcription for device ${deviceId}`);
            }
            messageBody = aiText || `[M\xEDdia: ${media.mimetype}]`;
          }
        } catch (mediaErr) {
          console.error(`[WhatsApp] Error processing media:`, mediaErr);
          await logSystemEvent("ai", "error", "Falha ao processar m\xEDdia com IA", { error: String(mediaErr) }, void 0, deviceId);
          if (!messageBody) {
            messageBody = `[M\xEDdia recebida: ${message.type}]`;
          }
        }
      }
      console.log(`[WhatsApp] Processing message from ${userNumber}: "${messageBody}"`);
      await saveMessageToDb(deviceId, userNumber, messageBody, "incoming", false, mediaUrl, mediaType);
      const device = await storage.getDevice(deviceId);
      if (!device) {
        console.log(`[WhatsApp] Device ${deviceId} not found in database`);
        return;
      }
      const sessionPausedChats = pausedChats.get(deviceId) || [];
      const isPaused = sessionPausedChats.includes(userNumber);
      const userMessageLower = message.body.toLowerCase().trim();
      const unpauseKeywords = ["menu", "ajuda", "inicio", "in\xEDcio", "start", "voltar", "sair", "opcoes", "op\xE7\xF5es"];
      if (isPaused) {
        if (unpauseKeywords.includes(userMessageLower)) {
          pausedChats.set(deviceId, sessionPausedChats.filter((id) => id !== userNumber));
          console.log(`[WhatsApp] Chat ${userNumber} was REACTIVATED by user on device ${deviceId}`);
        } else {
          console.log(`[WhatsApp] Chat ${userNumber} is paused on device ${deviceId}. Ignoring message.`);
          return;
        }
      }
      if (userMessageLower === "/status") {
        const statusMessage = `Bot Conectado!

- *Dispositivo:* ${device.name}
- *Status WhatsApp:* OK
- *Servidor:* OK
- *Gemini AI:* ${getAI() ? "OK" : "ERRO"}`;
        await client.sendMessage(userNumber, statusMessage);
        await saveMessageToDb(deviceId, userNumber, statusMessage, "outgoing", true);
        console.log(`[WhatsApp] Sent status message to ${userNumber}`);
        return;
      }
      if (device.activeLogicId) {
        const logic = await storage.getLogic(device.activeLogicId);
        if (logic && logic.isActive && logic.logicJson) {
          console.log(`[WhatsApp] Executing logic "${logic.name}" (${logic.id}) for device ${deviceId}`);
          const result = executeLogic(message.body, logic.logicJson);
          console.log(`[WhatsApp] Logic result: reply="${result.reply.substring(0, 50)}...", shouldPause=${result.shouldPause}`);
          if (result.mediaUrl) {
            try {
              const media = await MessageMedia.fromUrl(result.mediaUrl);
              await client.sendMessage(userNumber, media, { caption: result.reply });
              await saveMessageToDb(deviceId, userNumber, `[Media] ${result.reply}`, "outgoing", true);
              console.log(`[WhatsApp] Sent reply with media to ${userNumber}`);
            } catch (imgError) {
              console.error(`[WhatsApp] Failed to send media, sending text only:`, imgError);
              await client.sendMessage(message.from, result.reply);
              await saveMessageToDb(deviceId, userNumber, result.reply, "outgoing", true);
            }
          } else {
            await client.sendMessage(message.from, result.reply);
            await saveMessageToDb(deviceId, userNumber, result.reply, "outgoing", true);
            console.log(`[WhatsApp] Sent text reply to ${userNumber}`);
          }
          if (result.shouldPause) {
            const currentPaused = pausedChats.get(deviceId) || [];
            if (!currentPaused.includes(userNumber)) {
              currentPaused.push(userNumber);
              pausedChats.set(deviceId, currentPaused);
              console.log(`[WhatsApp] Chat ${userNumber} was PAUSED by logic on device ${deviceId}`);
            }
          }
        } else {
          console.log(`[WhatsApp] Logic not found or inactive for device ${deviceId}`);
        }
      } else {
        console.log(`[WhatsApp] No active logic configured for device ${deviceId}`);
      }
    } catch (error) {
      console.error(`[WhatsApp] Error handling message for device ${deviceId}:`, error);
      await logSystemEvent("bot", "error", "Erro ao processar mensagem", { error: String(error) }, void 0, deviceId);
    }
  });
  try {
    console.log(`[WhatsApp] Initializing client for device: ${deviceId} (timeout: ${INIT_TIMEOUT / 1e3}s)`);
    const initPromise = client.initialize();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Initialization timeout exceeded")), INIT_TIMEOUT);
    });
    await Promise.race([initPromise, timeoutPromise]);
    console.log(`[WhatsApp] Client initialized successfully for device: ${deviceId}`);
  } catch (err) {
    const errorMessage = err?.message || String(err);
    console.error(`[WhatsApp] Error initializing client for device ${deviceId}:`, errorMessage);
    await logSystemEvent("whatsapp", "error", `Falha ao inicializar: ${errorMessage}`, { error: errorMessage }, void 0, deviceId);
    session2.status = "DISCONNECTED";
    await storage.updateDevice(deviceId, { connectionStatus: "disconnected" });
    try {
      await client.destroy();
    } catch (destroyErr) {
      console.error(`[WhatsApp] Error destroying failed session:`, destroyErr);
    }
    if (session2.retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[Math.min(session2.retryCount, RETRY_DELAYS.length - 1)];
      console.log(`[WhatsApp] Will retry initialization in ${delay / 1e3}s`);
      setTimeout(async () => {
        await destroyWhatsAppSession(deviceId);
        await createWhatsAppSession(deviceId);
        const newSession = sessions2.get(deviceId);
        if (newSession) {
          newSession.retryCount = session2.retryCount + 1;
        }
      }, delay);
    }
  }
}
async function destroyWhatsAppSession(deviceId) {
  const session2 = sessions2.get(deviceId);
  if (!session2) {
    console.log(`[WhatsApp] No session found for device: ${deviceId}`);
    return false;
  }
  console.log(`[WhatsApp] Destroying session for device: ${deviceId}`);
  session2.status = "DESTROYING";
  try {
    await session2.client.destroy();
    sessions2.delete(deviceId);
    pausedChats.delete(deviceId);
    console.log(`[WhatsApp] Session destroyed for device: ${deviceId}`);
    return true;
  } catch (error) {
    console.error(`[WhatsApp] Error destroying session for device ${deviceId}:`, error);
    sessions2.delete(deviceId);
    pausedChats.delete(deviceId);
    return false;
  }
}
function getWhatsAppSessionStatus(deviceId) {
  const session2 = sessions2.get(deviceId);
  return session2?.status || "OFFLINE";
}
function getWhatsAppQRCode(deviceId) {
  const session2 = sessions2.get(deviceId);
  return session2?.qrCode || null;
}
async function sendWhatsAppMessage(deviceId, number, text2, mediaUrl, mediaType, mediaUrls, mediaTypes) {
  const session2 = sessions2.get(deviceId);
  if (!session2 || session2.status !== "READY") {
    console.log(`[WhatsApp] Cannot send message: device ${deviceId} is not ready`);
    return false;
  }
  try {
    let chatId = number;
    if (!number.includes("@")) {
      chatId = `${number.replace(/\D/g, "")}@c.us`;
    }
    if (text2) {
      await session2.client.sendMessage(chatId, text2);
      await saveMessageToDb(deviceId, number, text2, "outgoing", true);
    }
    if (mediaUrl && (!mediaUrls || mediaUrls.length === 0)) {
      try {
        let media;
        if (mediaUrl.startsWith("data:")) {
          const matches = mediaUrl.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            media = new MessageMedia(matches[1], matches[2], "media");
          }
        } else {
          media = await MessageMedia.fromUrl(mediaUrl);
        }
        if (media) {
          await session2.client.sendMessage(chatId, media);
          await saveMessageToDb(deviceId, number, `[Media] ${mediaType || "file"}`, "outgoing", true);
        }
      } catch (err) {
        console.error(`[WhatsApp] Failed to send single media:`, err);
      }
    }
    if (mediaUrls && mediaUrls.length > 0) {
      for (let i = 0; i < mediaUrls.length; i++) {
        const url = mediaUrls[i];
        const type = mediaTypes?.[i] || "image";
        try {
          let media;
          if (url.startsWith("data:")) {
            const matches = url.match(/^data:(.+);base64,(.+)$/);
            if (matches) media = new MessageMedia(matches[1], matches[2], "media");
          } else {
            media = await MessageMedia.fromUrl(url);
          }
          if (media) {
            await session2.client.sendMessage(chatId, media);
            await saveMessageToDb(deviceId, number, `[Media] ${type}`, "outgoing", true);
            await new Promise((resolve3) => setTimeout(resolve3, 500));
          }
        } catch (err) {
          console.error(`[WhatsApp] Failed to send media ${i + 1}:`, err);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`[WhatsApp] Error sending message from device ${deviceId}:`, error);
    return false;
  }
}
async function getWhatsAppContacts(deviceId, includeGroups = false) {
  const session2 = sessions2.get(deviceId);
  if (!session2 || session2.status !== "READY") {
    return [];
  }
  try {
    const chats = await session2.client.getChats();
    console.log(`[WhatsApp] Found ${chats.length} chats for device ${deviceId}`);
    if (chats.length > 0) {
      console.log(`[WhatsApp] First chat sample:`, JSON.stringify({
        id: chats[0].id,
        name: chats[0].name,
        isGroup: chats[0].isGroup
      }, null, 2));
    }
    const contacts = chats.filter((chat) => includeGroups ? true : !chat.isGroup).map((chat) => {
      try {
        const number = chat.id.user;
        return {
          id: chat.id._serialized,
          name: chat.name || number,
          number,
          profilePicUrl: null,
          // Skip profile pic to be safe and fast
          isGroup: chat.isGroup
        };
      } catch (err) {
        console.error(`[WhatsApp] Error mapping chat:`, err);
        return null;
      }
    }).filter((c) => c !== null);
    console.log(`[WhatsApp] Returning ${contacts.length} valid contacts`);
    return contacts;
  } catch (error) {
    console.error(`[WhatsApp] Error fetching contacts for device ${deviceId}:`, error);
    return [];
  }
}
async function syncContacts(deviceId) {
  const session2 = sessions2.get(deviceId);
  if (!session2) {
    console.error(`[WhatsApp] No session found for device ${deviceId}`);
    return false;
  }
  if (session2.status !== "READY") {
    console.error(`[WhatsApp] Session not ready for device ${deviceId}. Status: ${session2.status}`);
    return false;
  }
  try {
    console.log(`[WhatsApp] \u{1F504} Starting contact sync for device ${deviceId}...`);
    const chats = await session2.client.getChats();
    console.log(`[WhatsApp] Found ${chats.length} chats to process`);
    const dbConversations = await storage.getConversations(deviceId);
    console.log(`[WhatsApp] Found ${dbConversations.length} conversations in DB`);
    let updatedCount = 0;
    let errorCount = 0;
    for (const chat of chats) {
      if (chat.isGroup) continue;
      try {
        const number = chat.id.user;
        const name = chat.name || number;
        let profilePicUrl = null;
        try {
          profilePicUrl = await session2.client.getProfilePicUrl(chat.id._serialized);
          if (profilePicUrl) {
            console.log(`[WhatsApp] \u2705 Got profile pic for ${name}`);
          }
        } catch (picError) {
          console.log(`[WhatsApp] \u26A0\uFE0F No profile pic for ${name} (this is normal)`);
        }
        const conversation = dbConversations.find((c) => c.contactPhone === number);
        if (conversation) {
          const needsUpdate = conversation.contactName !== name || conversation.contactProfilePic !== profilePicUrl;
          if (needsUpdate) {
            await storage.updateConversation(conversation.id, {
              contactName: name,
              contactProfilePic: profilePicUrl
            });
            updatedCount++;
            console.log(`[WhatsApp] \u{1F4DD} Updated ${name} (${number})`);
          }
        }
      } catch (contactError) {
        errorCount++;
        console.error(`[WhatsApp] Error processing contact:`, contactError);
      }
    }
    console.log(`[WhatsApp] \u2705 Sync complete: ${updatedCount} updated, ${errorCount} errors`);
    return true;
  } catch (error) {
    console.error(`[WhatsApp] \u274C Fatal error syncing contacts for device ${deviceId}:`, error);
    return false;
  }
}
async function getContactProfilePic(deviceId, contactId) {
  const session2 = sessions2.get(deviceId);
  if (!session2 || session2.status !== "READY") return null;
  try {
    const contact = await session2.client.getContactById(contactId);
    return await contact.getProfilePicUrl();
  } catch (error) {
    return null;
  }
}
async function startDeviceSession(deviceId, userId) {
  try {
    const device = await storage.getDevice(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }
    if (device.userId !== userId) {
      throw new Error("Unauthorized: Device does not belong to this user");
    }
    if (sessions2.has(deviceId)) {
      const existingSession = sessions2.get(deviceId);
      if (existingSession && existingSession.status !== "DISCONNECTED" && existingSession.status !== "DESTROYING") {
        markDeviceActivity(deviceId);
        return {
          success: true,
          message: "Session already running",
          status: existingSession.status
        };
      }
    }
    console.log(`[Lazy-Load] Starting session for device ${deviceId} (user: ${userId})`);
    await createWhatsAppSession(deviceId);
    markDeviceActivity(deviceId);
    return {
      success: true,
      message: "Session started successfully",
      status: getWhatsAppSessionStatus(deviceId)
    };
  } catch (error) {
    console.error(`[Lazy-Load] Error starting device session:`, error);
    return {
      success: false,
      message: error.message || "Failed to start session"
    };
  }
}
function markDeviceActivity(deviceId) {
  if (deviceActivityTimers.has(deviceId)) {
    clearTimeout(deviceActivityTimers.get(deviceId));
  }
  const INACTIVITY_TIMEOUT = 30 * 60 * 1e3;
  const timer = setTimeout(async () => {
    console.log(`[Auto-Stop] Stopping inactive session: ${deviceId} (30min timeout)`);
    await destroyWhatsAppSession(deviceId);
    deviceActivityTimers.delete(deviceId);
  }, INACTIVITY_TIMEOUT);
  deviceActivityTimers.set(deviceId, timer);
}
async function stopDeviceSession(deviceId, userId) {
  try {
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== userId) {
      throw new Error("Unauthorized");
    }
    if (deviceActivityTimers.has(deviceId)) {
      clearTimeout(deviceActivityTimers.get(deviceId));
      deviceActivityTimers.delete(deviceId);
    }
    const destroyed = await destroyWhatsAppSession(deviceId);
    return {
      success: destroyed,
      message: destroyed ? "Session stopped successfully" : "Session not found or already stopped"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to stop session"
    };
  }
}
async function restoreWhatsAppSessions() {
  console.log("[WhatsApp] \u26A1 Lazy-loading enabled - Sessions will start on-demand");
  console.log("[WhatsApp] Skipping auto-restore to save memory and improve multi-tenant isolation");
}
function getClient(deviceId) {
  const session2 = sessions2.get(deviceId);
  return session2?.status === "READY" ? session2.client : null;
}
function getAllSessionsInfo() {
  const sessionsList = [];
  const now = /* @__PURE__ */ new Date();
  for (const [deviceId, session2] of Array.from(sessions2.entries())) {
    const uptimeMs = now.getTime() - session2.createdAt.getTime();
    sessionsList.push({
      deviceId,
      status: session2.status,
      createdAt: session2.createdAt,
      retryCount: session2.retryCount,
      hasQrCode: !!session2.qrCode,
      uptimeMinutes: Math.floor(uptimeMs / 6e4)
    });
  }
  return sessionsList;
}
async function forceCleanupSession(deviceId) {
  try {
    if (deviceActivityTimers.has(deviceId)) {
      clearTimeout(deviceActivityTimers.get(deviceId));
      deviceActivityTimers.delete(deviceId);
    }
    const session2 = sessions2.get(deviceId);
    if (!session2) {
      return { success: false, message: "Session not found" };
    }
    try {
      session2.status = "DESTROYING";
      await session2.client.destroy();
    } catch (err) {
      console.error(`[Admin] Error destroying client:`, err);
    }
    sessions2.delete(deviceId);
    pausedChats.delete(deviceId);
    try {
      const sessionPath = path3.join(process.cwd(), ".wwebjs_auth", `session-${deviceId}`);
      if (fs3.existsSync(sessionPath)) {
        fs3.rmSync(sessionPath, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error(`[Admin] Error cleaning session files:`, cleanupErr);
    }
    console.log(`[Admin] Force cleaned session: ${deviceId}`);
    return { success: true, message: "Session force cleaned" };
  } catch (error) {
    console.error(`[Admin] Force cleanup error:`, error);
    return { success: false, message: error.message || "Cleanup failed" };
  }
}
async function cleanupOrphanSessions() {
  let cleaned = 0;
  let errors = 0;
  for (const [deviceId, session2] of Array.from(sessions2.entries())) {
    if (session2.status === "DISCONNECTED" || session2.status === "DESTROYING" || session2.status === "AUTH_FAILURE") {
      const result = await forceCleanupSession(deviceId);
      if (result.success) {
        cleaned++;
      } else {
        errors++;
      }
    }
  }
  console.log(`[Admin] Orphan cleanup: ${cleaned} cleaned, ${errors} errors`);
  return { cleaned, errors };
}
function getActiveSessionCount() {
  let ready = 0, pending = 0, disconnected = 0;
  for (const session2 of Array.from(sessions2.values())) {
    switch (session2.status) {
      case "READY":
        ready++;
        break;
      case "INITIALIZING":
      case "QR_PENDING":
        pending++;
        break;
      default:
        disconnected++;
    }
  }
  return {
    total: sessions2.size,
    ready,
    pending,
    disconnected
  };
}
var Client, LocalAuth, MessageMedia, aiInstance, RETRY_DELAYS, MAX_RETRIES, INIT_TIMEOUT, sessions2, pausedChats, deviceActivityTimers;
var init_whatsappManager = __esm({
  "server/whatsappManager.ts"() {
    "use strict";
    init_storage();
    init_logicExecutor();
    init_logManager();
    ({ Client, LocalAuth, MessageMedia } = pkg);
    aiInstance = null;
    RETRY_DELAYS = [5e3, 15e3, 45e3, 12e4];
    MAX_RETRIES = 4;
    INIT_TIMEOUT = 12e4;
    sessions2 = /* @__PURE__ */ new Map();
    pausedChats = /* @__PURE__ */ new Map();
    deviceActivityTimers = /* @__PURE__ */ new Map();
  }
});

// server/loadEnv.ts
import fs from "fs";
import path from "path";
var isReplit = process.env.REPL_ID !== void 0;
if (isReplit) {
  const secretsPath = "/tmp/.secrets";
  try {
    if (fs.existsSync(secretsPath)) {
      const secretsData = fs.readFileSync(secretsPath, "utf8");
      const secrets = JSON.parse(secretsData);
      for (const [key, value] of Object.entries(secrets)) {
        if (!process.env[key]) {
          process.env[key] = String(value);
        }
      }
      console.log("[loadEnv] Loaded secrets from Replit");
    } else {
      console.warn("[loadEnv] No secrets file found at /tmp/.secrets");
    }
  } catch (error) {
    console.warn("[loadEnv] Error loading secrets:", error);
  }
}
var envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      }
    });
    console.log("[loadEnv] Loaded .env file");
  } catch (error) {
    console.warn("[loadEnv] Error loading .env:", error);
  }
}
if (!process.env.DATABASE_URL) {
  console.error("[loadEnv] DATABASE_URL not found in environment");
  console.error("[loadEnv] Available env vars:", Object.keys(process.env).filter((k) => k.includes("DATA") || k.includes("PG")));
} else {
  console.log("[loadEnv] DATABASE_URL loaded successfully (length:", process.env.DATABASE_URL.length, ")");
}
console.log("[loadEnv] PGHOST:", process.env.PGHOST || "EMPTY");
console.log("[loadEnv] PGUSER:", process.env.PGUSER || "EMPTY");
console.log("[loadEnv] PGDATABASE:", process.env.PGDATABASE || "EMPTY");
console.log("[loadEnv] PGPORT:", process.env.PGPORT || "EMPTY");
console.log("[loadEnv] PGPASSWORD:", process.env.PGPASSWORD ? "***" : "EMPTY");
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (PGUSER && PGHOST && PGDATABASE) {
    const password = PGPASSWORD || "";
    const port = PGPORT || "5432";
    const host = PGHOST || "localhost";
    process.env.DATABASE_URL = `postgresql://${PGUSER}:${password}@${host}:${port}/${PGDATABASE}`;
    console.log("[loadEnv] Constructed DATABASE_URL from PG* variables");
  }
}

// server/index-prod.ts
import fs5 from "node:fs";
import path5 from "node:path";
import express3 from "express";

// server/app.ts
import express2 from "express";

// server/routes.ts
init_storage();
import express from "express";
import bcrypt2 from "bcryptjs";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import Stripe from "stripe";
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";

// server/localAuth.ts
init_storage();
init_schema();
import bcrypt from "bcryptjs";
import session from "express-session";
import createMemoryStore from "memorystore";
import { z as z2 } from "zod";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: sessionTtl
  });
  const sessionSecret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!sessionSecret || sessionSecret === "default-secret-change-in-production")) {
    console.error("\u26A0\uFE0F  CRITICAL: SESSION_SECRET not set in production! Set a strong random value in .env");
    process.exit(1);
  }
  return session({
    secret: sessionSecret || "default-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const { username, password, email } = validatedData;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Usu\xE1rio j\xE1 existe" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
      const user = await storage.createUser({
        username,
        passwordHash,
        email: email || null,
        firstName: null,
        lastName: null,
        currentPlan: "free",
        planExpiresAt
      });
      req.session.userId = user.id;
      await new Promise((resolve3, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve3();
        });
      });
      res.json({ message: "Usu\xE1rio criado com sucesso", user: { id: user.id, username: user.username, currentPlan: user.currentPlan } });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erro ao criar usu\xE1rio" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const { username, password } = validatedData;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      req.session.userId = user.id;
      await new Promise((resolve3, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve3();
        });
      });
      res.json({ message: "Login bem-sucedido", user: { id: user.id, username: user.username, currentPlan: user.currentPlan } });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout bem-sucedido" });
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: "N\xE3o autenticado" });
  }
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o encontrado" });
    }
    req.user = { claims: { sub: user.id } };
    next();
  } catch (error) {
    console.error("Error verifying authentication:", error);
    res.status(401).json({ message: "Erro de autentica\xE7\xE3o" });
  }
};

// server/routes.ts
init_schema();
init_logicExecutor();
init_whatsappManager();
init_whatsappManager();
import { z as z3 } from "zod";

// server/broadcastProcessor.ts
init_storage();
init_whatsappManager();
init_logManager();
var runningBroadcasts = /* @__PURE__ */ new Map();
async function processBroadcast(broadcastId) {
  console.log(`[Broadcast] Starting processor for broadcast ${broadcastId}`);
  logSystemEvent("broadcast", "info", `Iniciando disparo ${broadcastId}`, { broadcastId });
  if (runningBroadcasts.has(broadcastId)) {
    console.log(`[Broadcast] Already running for ${broadcastId}`);
    return;
  }
  const runLoop = async () => {
    try {
      const broadcast = await storage.getBroadcast(broadcastId);
      if (!broadcast) {
        console.log(`[Broadcast] Broadcast ${broadcastId} not found, stopping`);
        stopBroadcast(broadcastId);
        return;
      }
      if (broadcast.status === "paused") {
        console.log(`[Broadcast] Broadcast ${broadcastId} paused`);
        stopBroadcast(broadcastId);
        return;
      }
      if (broadcast.status === "completed" || broadcast.status === "failed") {
        console.log(`[Broadcast] Broadcast ${broadcastId} finished`);
        logSystemEvent("broadcast", "info", `Disparo ${broadcastId} finalizado`, { status: broadcast.status });
        stopBroadcast(broadcastId);
        return;
      }
      const contacts = await storage.getBroadcastContacts(broadcastId);
      const nextContact = contacts.find((c) => c.status === "pending");
      if (!nextContact) {
        await storage.updateBroadcast(broadcastId, {
          status: "completed",
          completedAt: /* @__PURE__ */ new Date()
        });
        console.log(`[Broadcast] All contacts processed for ${broadcastId}`);
        logSystemEvent("broadcast", "info", `Disparo ${broadcastId} conclu\xEDdo com sucesso`, { broadcastId });
        stopBroadcast(broadcastId);
        return;
      }
      if (!nextContact.contactPhone) {
        console.error(`[Broadcast] Invalid contact phone for contact ID ${nextContact.id}`);
        await storage.updateBroadcastContact(nextContact.id, {
          status: "failed",
          errorMessage: "Invalid phone number"
        });
        await storage.updateBroadcast(broadcastId, {
          failedCount: broadcast.failedCount + 1
        });
        const timeout2 = setTimeout(runLoop, 100);
        runningBroadcasts.set(broadcastId, timeout2);
        return;
      }
      console.log(`[Broadcast] Sending message to ${nextContact.contactPhone}`);
      try {
        const sent = await sendWhatsAppMessage(
          broadcast.deviceId,
          nextContact.contactPhone,
          broadcast.message,
          broadcast.mediaUrl,
          broadcast.mediaType,
          broadcast.mediaUrls,
          broadcast.mediaTypes
        );
        if (sent) {
          await storage.updateBroadcastContact(nextContact.id, {
            status: "sent",
            sentAt: /* @__PURE__ */ new Date()
          });
          await storage.updateBroadcast(broadcastId, {
            sentCount: broadcast.sentCount + 1
          });
          console.log(`[Broadcast] Message sent successfully to ${nextContact.contactPhone}`);
        } else {
          throw new Error("Failed to send message");
        }
      } catch (error) {
        console.error(`[Broadcast] Error sending to ${nextContact.contactPhone}:`, error);
        logSystemEvent("broadcast", "error", `Erro ao enviar para ${nextContact.contactPhone}`, { error: error.message, broadcastId });
        await storage.updateBroadcastContact(nextContact.id, {
          status: "failed",
          errorMessage: error.message || "Failed to send"
        });
        await storage.updateBroadcast(broadcastId, {
          failedCount: broadcast.failedCount + 1
        });
      }
      const delay = (broadcast.delay || 20) * 1e3;
      const timeout = setTimeout(runLoop, delay);
      runningBroadcasts.set(broadcastId, timeout);
    } catch (error) {
      console.error(`[Broadcast] Critical error in processor:`, error);
      stopBroadcast(broadcastId);
    }
  };
  runLoop();
}
function stopBroadcast(broadcastId) {
  const timeout = runningBroadcasts.get(broadcastId);
  if (timeout) {
    clearTimeout(timeout);
    runningBroadcasts.delete(broadcastId);
    console.log(`[Broadcast] Stopped processor for ${broadcastId}`);
  }
}
var schedulerInterval = null;
function startBroadcastScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  console.log("[Scheduler] \u{1F4C5} Starting broadcast scheduler (30s interval)");
  schedulerInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      const broadcasts2 = await storage.getAllScheduledBroadcasts();
      for (const broadcast of broadcasts2) {
        if (broadcast.scheduledFor) {
          const scheduledTime = new Date(broadcast.scheduledFor);
          if (scheduledTime <= now) {
            console.log(`[Scheduler] \u23F0 Starting scheduled broadcast: ${broadcast.name}`);
            await storage.updateBroadcast(broadcast.id, { status: "running" });
            processBroadcast(broadcast.id);
            logSystemEvent("broadcast", "info", `Disparo agendado iniciado: ${broadcast.name}`, { broadcastId: broadcast.id });
          }
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error checking scheduled broadcasts:", error);
    }
  }, 3e4);
  setTimeout(async () => {
    console.log("[Scheduler] Running initial check for scheduled broadcasts...");
  }, 5e3);
}

// server/routes.ts
import * as fs4 from "fs";
import * as path4 from "path";
import puppeteer from "puppeteer";

// server/templates.ts
var LOGIC_TEMPLATES = [
  {
    id: "lcmelo-template",
    name: "LC Melo Parafusos",
    description: "Modelo completo de atendimento para ind\xFAstria/loja (LC Melo).",
    category: "Exemplos Reais",
    logic: {
      default_reply: "Desculpe, n\xE3o entendi sua solicita\xE7\xE3o. Por favor, escolha uma das op\xE7\xF5es numeradas.\n\nPara falar com um atendente, digite *5*.\nDigite *menu* para voltar ao in\xEDcio.",
      pause_bot_after_reply: false,
      rules: [
        {
          keywords: ["oi", "ola", "ol\xE1", "bom dia", "boa tarde", "boa noite", "menu", "ajuda", "inicio", "in\xEDcio", "start", "voltar", "sair", "opcoes", "op\xE7\xF5es"],
          reply: "Ol\xE1! \u{1F44B} Sou o assistente virtual da LC Melo Parafusos e Gabaritos.\n\nSe preferir, digite *5* para falar diretamente com um atendente.\n\nComo posso ajudar?\n\n1\uFE0F\u20E3 - Sobre a LC Melo\n2\uFE0F\u20E3 - Ver Produtos\n3\uFE0F\u20E3 - Solicitar Or\xE7amento / Falar com Vendas\n4\uFE0F\u20E3 - Falar com o Financeiro\n5\uFE0F\u20E3 - Outros assuntos Diversos",
          pause_bot_after_reply: false
        },
        {
          keywords: ["1"],
          reply: "Com 30 anos de mercado, a LCM IND\xDASTRIA conta com uma equipe de profissionais altamente qualificados. Desenvolve produtos para profissionais do setor moveleiro, parafusos e prolongadores para pastas e mostru\xE1rios.\n\nEstamos localizados na Rua Hon\xF3rio Maia, 864 galp\xE3o D, Tatuap\xE9 - CEP 03072-000 - S\xE3o Paulo -SP\n\nNosso site: www.lcmelo.com.br\nInstagram: https://www.instagram.com/lcmgabaritos/\nNossa Loja: www.lcmgabaritos.com.br\n\nDigite *menu* para voltar.",
          pause_bot_after_reply: false
        },
        {
          keywords: ["2"],
          reply: "\xD3timo! Sobre quais produtos voc\xEA gostaria de saber mais? (Digite *P + o n\xFAmero*):\n\nP1 \u2013 Parafusos\nP2 \u2013 Gabaritos\n\nDigite *menu* para voltar.",
          pause_bot_after_reply: false
        },
        {
          keywords: ["p1", "parafusos"],
          reply: "Aqui est\xE3o nossos parafusos. Veja mais em nossa loja:\n\n\u{1F449} https://www.lcmgabaritos.com.br/parafusos/\n\nDigite *2* para voltar ao menu de produtos ou *menu* para o in\xEDcio.",
          pause_bot_after_reply: false
        },
        {
          keywords: ["p2", "gabaritos"],
          reply: "Aqui est\xE3o nossos gabaritos. Veja mais em nossa loja:\n\n\u{1F449} https://www.lcmgabaritos.com.br/gabaritos/\n\nDigite *2* para voltar ao menu de produtos ou *menu* para o in\xEDcio.",
          pause_bot_after_reply: false
        },
        {
          keywords: ["3", "orcamento", "cotacao", "preco", "comprar", "pedido", "vendas", "vendedor", "comercial"],
          reply: "Entendi. Para cota\xE7\xF5es, disponibilidade, pre\xE7os e para falar com nossa equipe comercial, por favor, entre em contato:\n\n\u{1F4DE} Telefone: *(11) 2641-3508*\n\u{1F4F1} WhatsApp Vendas: *11 95323-9904*\n\u{1F4E7} E-mail: *atendimento@lcmelo.com.br*\n\n*O assistente virtual ser\xE1 pausado para n\xE3o atrapalhar.* Para reativ\xE1-lo, basta digitar *menu*. \u{1F642}",
          pause_bot_after_reply: true
        },
        {
          keywords: ["4", "financeiro", "boleto", "pagamento", "nfe"],
          reply: "Para falar com o Financeiro, por favor, entre em contato pelo WhatsApp:\n\n\u{1F4F1} WhatsApp Financeiro: *11 98810-7493*\n\n*O assistente virtual ser\xE1 pausado para n\xE3o atrapalhar.* Para reativ\xE1-lo, basta digitar *menu*. \u{1F642}",
          pause_bot_after_reply: true
        },
        {
          keywords: ["5", "contato", "falar com atendente", "atendente", "falar com alguem", "humano", "outros", "diversos", "outros assuntos"],
          reply: "Entendido. Para falar com nossa equipe sobre outros assuntos, por favor, use um dos canais abaixo:\n\n\u{1F4F1} WhatsApp Atendimento: *11 95323-9904*\n\u{1F4E7} E-mail: *atendimento@lcmelo.com.br*\n\n*O assistente virtual ser\xE1 pausado para n\xE3o atrapalhar.* Para reativ\xE1-lo, basta digitar *menu*. \u{1F642}",
          pause_bot_after_reply: true
        }
      ]
    }
  },
  {
    id: "fight-arcade-template",
    name: "Fight Arcade",
    description: "Loja de controles e fliperamas - atendimento completo com FAQ.",
    category: "Exemplos Reais",
    logic: {
      default_reply: "Ol\xE1! Bem-vindo \xE0 Fight Arcade! \u{1F3AE}\n\nSou o assistente virtual e estou aqui para ajudar. Como posso te auxiliar hoje?\n\n1\uFE0F\u20E3 - Ver Produtos\n2\uFE0F\u20E3 - Informa\xE7\xF5es sobre Envio\n3\uFE0F\u20E3 - Formas de Pagamento\n4\uFE0F\u20E3 - Garantia e Devolu\xE7\xE3o\n5\uFE0F\u20E3 - Falar com Atendente\n\nDigite o n\xFAmero da op\xE7\xE3o desejada ou fa\xE7a sua pergunta!",
      pause_bot_after_reply: false,
      rules: [
        {
          keywords: ["oi", "ola", "ol\xE1", "bom dia", "boa tarde", "boa noite", "menu", "ajuda", "inicio", "in\xEDcio"],
          reply: "Ol\xE1! Bem-vindo \xE0 Fight Arcade! \u{1F3AE}\n\nSou o assistente virtual e estou aqui para ajudar. Como posso te auxiliar hoje?\n\n1\uFE0F\u20E3 - Ver Produtos\n2\uFE0F\u20E3 - Informa\xE7\xF5es sobre Envio\n3\uFE0F\u20E3 - Formas de Pagamento\n4\uFE0F\u20E3 - Garantia e Devolu\xE7\xE3o\n5\uFE0F\u20E3 - Falar com Atendente\n\nDigite o n\xFAmero da op\xE7\xE3o desejada ou fa\xE7a sua pergunta!",
          pause_bot_after_reply: false
        },
        {
          keywords: ["1", "produtos", "controles", "fliperamas", "arcade"],
          reply: "Temos diversos produtos incr\xEDveis! \u{1F579}\uFE0F\n\nAcesse nossa loja completa:\n\u{1F449} https://www.fightarcade.com.br/\n\nOu veja nossas plataformas:\n\u{1F6D2} Mercado Livre: https://www.mercadolivre.com.br/perfil/FIGHTARCADEOFICIAL\n\u{1F6CD}\uFE0F Shopee: https://shopee.com.br/fightarcade\n\nPosso ajudar com algo mais?",
          pause_bot_after_reply: false
        },
        {
          keywords: ["2", "entrega", "envio", "frete", "rastreamento", "prazo"],
          reply: "Fazemos entregas em todo o Brasil! \u{1F4E6}\n\n- **Frete e Prazo:** Calculados no checkout (Mercado Livre/Shopee) ou informados pelo atendente.\n- **Entrega no Mesmo Dia:** Grande S\xE3o Paulo via motoboy (consulte disponibilidade).\n- **Rastreamento:** Voc\xEA receber\xE1 o c\xF3digo por e-mail ap\xF3s o despacho.\n\nPosso ajudar com algo mais?",
          pause_bot_after_reply: false
        },
        {
          keywords: ["3", "pagamento", "pagar", "parcelamento", "pix", "boleto", "cartao"],
          reply: "Aceitamos diversas formas de pagamento:\n\n- **Cart\xE3o de Cr\xE9dito:** Parcelado em at\xE9 12x\n- **PIX:** Geralmente com desconto especial!\n- **Boleto Banc\xE1rio**\n\nPosso ajudar com algo mais?",
          pause_bot_after_reply: false
        },
        {
          keywords: ["4", "garantia", "devolucao", "defeito", "arrependimento"],
          reply: "Sua tranquilidade \xE9 nossa prioridade! \u2705\n\n- **Garantia:** 1 ano para placas controladoras, 90 dias para demais componentes (contra defeitos de fabrica\xE7\xE3o).\n- **Devolu\xE7\xE3o:** 7 dias corridos ap\xF3s recebimento (produto na embalagem original, sem uso).\n*Obs: N\xE3o se aplica a produtos personalizados.*\n\nPosso ajudar com algo mais?",
          pause_bot_after_reply: false
        },
        {
          keywords: ["5", "atendente", "humano", "falar com alguem", "contato"],
          reply: "Claro! Para falar com nossa equipe:\n\n\u{1F4F1} WhatsApp: (11) 97898-4413\n\u{1F4E7} E-mail: contato@fightarcade.com.br\n\u{1F550} Hor\xE1rio: Segunda a Sexta, 9h \xE0s 18h\n\n*O assistente ser\xE1 pausado. Digite 'menu' para reativ\xE1-lo.*",
          pause_bot_after_reply: true
        },
        {
          keywords: ["instagram", "redes sociais", "facebook"],
          reply: "Siga-nos no Instagram! \u{1F4F8}\n\n\u{1F449} @fightarcadeoficial\n\nFique por dentro de novidades, promo\xE7\xF5es e veja nossos produtos em a\xE7\xE3o!\n\nPosso ajudar com algo mais?",
          pause_bot_after_reply: false
        }
      ]
    }
  },
  {
    id: "ai-assistant",
    name: "Assistente com IA (H\xEDbrido)",
    description: "Bot inteligente que usa IA para responder o que n\xE3o estiver nas regras.",
    category: "Intelig\xEAncia Artificial",
    logic: {
      default_reply: "",
      pause_bot_after_reply: false,
      rules: [
        {
          keywords: ["falar", "humano", "atendente"],
          reply: "Vou chamar um especialista humano para te ajudar.",
          pause_bot_after_reply: true
        },
        {
          keywords: ["pre\xE7o", "valor", "custo"],
          reply: "Nossos planos come\xE7am a partir de R$ 29,90. Quer saber mais?",
          pause_bot_after_reply: false
        }
      ]
    }
  }
];

// server/routes.ts
import multer from "multer";
var upload = multer({ storage: multer.memoryStorage() });
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" }) : null;
var aiInstance2 = null;
var userAiInstances = /* @__PURE__ */ new Map();
function getAI2(userApiKey) {
  if (userApiKey) {
    if (userAiInstances.has(userApiKey)) {
      return userAiInstances.get(userApiKey);
    }
    const userAi = new GoogleGenAI2({ apiKey: userApiKey });
    userAiInstances.set(userApiKey, userAi);
    return userAi;
  }
  if (aiInstance2) return aiInstance2;
  let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    try {
      const envPath2 = path4.resolve(process.cwd(), ".env");
      if (fs4.existsSync(envPath2)) {
        const envContent = fs4.readFileSync(envPath2, "utf8");
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
          geminiKey = match[1].trim();
          process.env.GEMINI_API_KEY = geminiKey;
          console.log("[Gemini] Loaded API Key from .env file fallback");
        }
      }
    } catch (err) {
      console.error("[Gemini] Failed to read .env file fallback:", err);
    }
  }
  if (geminiKey) {
    aiInstance2 = new GoogleGenAI2({ apiKey: geminiKey });
  } else {
    console.error("[Gemini] API Key not found in environment or .env file");
  }
  return aiInstance2;
}
async function registerRoutes(app2) {
  app2.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      const fileExtension = path4.extname(req.file.originalname);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
      const uploadDir = path4.join(process.cwd(), "uploads");
      if (!fs4.existsSync(uploadDir)) {
        fs4.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path4.join(uploadDir, fileName);
      fs4.writeFileSync(filePath, req.file.buffer);
      const fileUrl = `/uploads/${fileName}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Erro ao fazer upload" });
    }
  });
  await setupAuth(app2);
  app2.use("/uploads", express.static(path4.join(process.cwd(), "uploads")));
  app2.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.post("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMessageTemplateSchema.parse({
        ...req.body,
        userId
      });
      const template = await storage.createTemplate(data);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });
  app2.put("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const template = await storage.updateTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });
  app2.delete("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteTemplate(id);
      res.json({ message: "Template deleted" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  app2.post("/api/ai/edit-template", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, instruction, currentJson, prompt, sourceType, sourceContent, useEmojis } = req.body;
      const textToEdit = content || (currentJson ? JSON.stringify(currentJson, null, 2) : "");
      const userPrompt = instruction || prompt || "";
      if (!textToEdit || !userPrompt) {
        return res.status(400).json({ message: "Content/currentJson and instruction/prompt are required" });
      }
      const user = await storage.getUser(userId);
      const ai = getAI2(user?.geminiApiKey);
      if (!ai) {
        console.error("[AI Error] Gemini API Key is missing or invalid.");
        return res.status(500).json({ message: "AI service not configured - Check server logs for API Key issues" });
      }
      let context = "";
      if (sourceType === "url" && sourceContent) {
        let browser;
        try {
          const puppeteer2 = (await import("puppeteer")).default;
          browser = await puppeteer2.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
          });
          const page = await browser.newPage();
          await page.goto(sourceContent, { waitUntil: "networkidle2", timeout: 3e4 });
          context = await page.evaluate(() => document.body.innerText);
          await browser.close();
          context = context.slice(0, 1e4);
        } catch (e) {
          console.error("[AI Edit] Scraping error:", e.message);
          if (browser) await browser.close().catch(() => {
          });
        }
      } else if (sourceType === "text" && sourceContent) {
        context = sourceContent;
      }
      const systemPrompt = `You are an AI assistant that edits text based on instructions.
        
${context ? `CONTEXT FROM SOURCE:
${context.slice(0, 5e3)}

` : ""}
ORIGINAL TEXT:
${textToEdit}

INSTRUCTION:
${userPrompt}

Please provide the EDITED TEXT based on the instruction.
${useEmojis ? "You can use emojis to make it more engaging." : "Avoid using emojis."}
Maintain the original format as much as possible unless asked to change it.
${currentJson ? "If the original is JSON, return valid JSON." : "Return ONLY the edited text, no explanations."}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt
      });
      const editedText = response.text || "";
      if (currentJson) {
        try {
          const cleanedText = editedText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsedJson = JSON.parse(cleanedText);
          return res.json({ original: currentJson, edited: editedText, logicJson: parsedJson });
        } catch (e) {
          return res.json({ original: textToEdit, edited: editedText });
        }
      }
      res.json({ original: textToEdit, edited: editedText });
    } catch (error) {
      console.error("Error editing template with AI:", error);
      res.status(500).json({ message: `Failed to edit template: ${error.message}` });
    }
  });
  app2.post("/api/ai/extract-menu", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sourceType, sourceContent, instruction } = req.body;
      if (!sourceType || !sourceContent) {
        return res.status(400).json({ message: "sourceType and sourceContent are required" });
      }
      const user = await storage.getUser(userId);
      const ai = getAI2(user?.geminiApiKey);
      if (!ai) {
        console.error("[AI Error] Gemini API Key is missing or invalid.");
        return res.status(500).json({ message: "AI service not configured - Check server logs for API Key issues" });
      }
      let extractedText = "";
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (sourceType === "image") {
        try {
          const prompt = `Extract ALL visible text from this image/document and format it as a clean, organized menu/list. ${instruction || "Format with relevant emojis and prices as R$ XX,XX if visible."}`;
          if (sourceContent.startsWith("data:")) {
            const parts = sourceContent.split(",");
            if (parts.length < 2 || !parts[1]) {
              return res.status(400).json({ message: "Invalid file format - missing data" });
            }
            const base64Data = parts[1];
            if (!base64Data || base64Data.length < 100) {
              return res.status(400).json({ message: "Invalid file - data too short or empty" });
            }
            const estimatedSize = base64Data.length * 3 / 4;
            if (estimatedSize > MAX_FILE_SIZE) {
              return res.status(413).json({ message: `File too large. Maximum: 10MB (current: ${(estimatedSize / 1024 / 1024).toFixed(1)}MB)` });
            }
            const mimeMatch = sourceContent.match(/^data:([^;]+);/);
            if (!mimeMatch) {
              return res.status(400).json({ message: "Invalid file format - cannot detect type" });
            }
            const mimeType = mimeMatch[1];
            const supportedTypes = [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
              "image/webp",
              "image/bmp",
              "image/heic",
              "image/heif",
              "image/tiff",
              "image/svg+xml",
              "application/pdf"
            ];
            if (!supportedTypes.includes(mimeType)) {
              return res.status(400).json({
                message: `Unsupported format: ${mimeType}. Supported: JPG, PNG, GIF, WebP, HEIC, PDF`
              });
            }
            console.log(`[AI Extract] Processing ${mimeType}, size: ${(estimatedSize / 1024).toFixed(1)}KB`);
            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash-exp",
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data
                    }
                  }
                ]
              }]
            });
            extractedText = response.text || "";
            if (!extractedText || extractedText.trim().length < 10) {
              return res.status(400).json({ message: "No text detected in this file. Please ensure the image/PDF contains visible text." });
            }
          } else {
            try {
              console.log(`[AI Extract] Fetching image from URL: ${sourceContent.substring(0, 100)}...`);
              const imageResponse = await fetch(sourceContent);
              if (!imageResponse.ok) {
                return res.status(400).json({ message: `Failed to fetch image: ${imageResponse.statusText}` });
              }
              const contentType = imageResponse.headers.get("content-type") || "";
              if (!contentType.startsWith("image/")) {
                return res.status(400).json({ message: `URL does not point to an image (type: ${contentType})` });
              }
              const arrayBuffer = await imageResponse.arrayBuffer();
              if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
                return res.status(413).json({
                  message: `Image too large. Maximum: 10MB (current: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB)`
                });
              }
              const base64Data = Buffer.from(arrayBuffer).toString("base64");
              console.log(`[AI Extract] Fetched ${contentType}, size: ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB`);
              const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: [{
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: contentType,
                        data: base64Data
                      }
                    }
                  ]
                }]
              });
              extractedText = response.text || "";
              if (!extractedText || extractedText.trim().length < 10) {
                return res.status(400).json({ message: "No text detected in this image." });
              }
            } catch (fetchError) {
              console.error("[AI Extract] Failed to fetch image from URL:", fetchError);
              return res.status(500).json({ message: `Failed to load image from URL: ${fetchError.message}` });
            }
          }
        } catch (error) {
          console.error("[AI Extract] Processing error:", error);
          return res.status(500).json({ message: `Failed to process file: ${error.message}` });
        }
      } else if (sourceType === "url") {
        let browser;
        try {
          console.log(`[AI Extract] Scraping URL: ${sourceContent.substring(0, 100)}...`);
          const puppeteer2 = (await import("puppeteer")).default;
          browser = await puppeteer2.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
          });
          const page = await browser.newPage();
          await page.goto(sourceContent, { waitUntil: "networkidle2", timeout: 3e4 });
          const pageText = await page.evaluate(() => document.body.innerText);
          await browser.close();
          if (!pageText || pageText.trim().length < 50) {
            return res.status(400).json({ message: "Very little text found on this page. Please check the URL." });
          }
          const prompt = `Extract menu items from this text and format them nicely with emojis and prices:

${pageText.slice(0, 1e4)}

${instruction || "Format as a WhatsApp message with emojis."}`;
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt
          });
          extractedText = response.text || "";
        } catch (e) {
          console.error("[AI Extract] Scraping error:", e.message);
          if (browser) await browser.close().catch(() => {
          });
          return res.status(500).json({ message: `Failed to extract from URL: ${e.message}` });
        }
      } else if (sourceType === "text") {
        if (!sourceContent || sourceContent.trim().length < 10) {
          return res.status(400).json({ message: "Text is too short or empty" });
        }
        const prompt = `Format this menu/list nicely with emojis and proper structure:

${sourceContent}

${instruction || "Format as a WhatsApp message with emojis."}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt
        });
        extractedText = response.text || "";
      }
      res.json({ extracted: extractedText });
    } catch (error) {
      console.error("Error extracting menu:", error);
      res.status(500).json({ message: `Failed to extract menu: ${error.message}` });
    }
  });
  app2.get("/api/logics/templates", isAuthenticated, async (req, res) => {
    try {
      const templates = [
        {
          id: "template_welcome",
          name: "Saudacao Simples",
          category: "Basico",
          description: "Responde a saudacoes basicas como Oi, Ola, Bom dia.",
          logic: {
            rules: [
              {
                keywords: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "hey", "hello"],
                reply: "Ola! \u{1F44B} Como posso ajudar voce hoje?"
              }
            ],
            default_reply: "Desculpe, nao entendi. Por favor, reformule sua pergunta.",
            pause_bot_after_reply: false
          },
          logicType: "json"
        },
        {
          id: "template_menu",
          name: "Menu de Opcoes",
          category: "Atendimento",
          description: "Apresenta um menu numerado para o cliente.",
          logic: {
            rules: [
              {
                keywords: ["menu", "opcoes", "ajuda", "inicio"],
                reply: "\u{1F4CB} *Menu Principal*\n\n1\uFE0F\u20E3 Ver Produtos\n2\uFE0F\u20E3 Fazer Pedido\n3\uFE0F\u20E3 Falar com Atendente\n4\uFE0F\u20E3 Horario de Funcionamento\n\nDigite o numero da opcao desejada."
              },
              {
                keywords: ["1", "produtos", "produto"],
                reply: "\u{1F6CD}\uFE0F *Nossos Produtos:*\n\n- Plano Basico: R$ 29,90/mes\n- Plano Premium: R$ 59,90/mes\n- Plano Empresarial: R$ 99,90/mes\n\nPara mais detalhes, digite 'mais info' ou 'menu'."
              },
              {
                keywords: ["2", "pedido", "comprar"],
                reply: "\u{1F4E6} *Fazer Pedido*\n\nPor favor, me informe:\n1. Qual produto deseja?\n2. Forma de pagamento (PIX, Cartao, Boleto)\n\nOu digite 'menu' para voltar."
              },
              {
                keywords: ["3", "atendente", "suporte", "humano"],
                reply: "\u{1F464} Um atendente ira falar com voce em instantes.\n\nAguarde um momento... \u23F3",
                pause_bot: true
              },
              {
                keywords: ["4", "horario", "horarios", "funcionamento"],
                reply: "\u{1F550} *Horario de Atendimento:*\n\nSeg-Sex: 9h as 18h\nSabado: 9h as 13h\nDomingo: Fechado\n\nDigite 'menu' para voltar."
              }
            ],
            default_reply: "Desculpe, nao entendi. Digite *menu* para ver as opcoes.",
            pause_bot_after_reply: false
          },
          logicType: "json"
        },
        {
          id: "template_faq",
          name: "FAQ Automatico",
          category: "Suporte",
          description: "Responde perguntas frequentes automaticamente.",
          logic: {
            rules: [
              {
                keywords: ["preco", "valor", "quanto custa", "custo"],
                reply: "\u{1F4B0} *Nossos Precos:*\n\nPlano Basico: R$ 29,90/mes\nPlano Premium: R$ 59,90/mes\nPlano Empresarial: R$ 99,90/mes\n\nTodos com 7 dias de teste gratis! \u{1F381}"
              },
              {
                keywords: ["horario", "aberto", "fecha", "funcionamento"],
                reply: "\u{1F550} Atendemos de Seg-Sex das 9h as 18h e Sabado das 9h as 13h."
              },
              {
                keywords: ["entrega", "prazo", "demora"],
                reply: "\u{1F4E6} Prazo de entrega: 3 a 5 dias uteis para todo Brasil via Correios."
              },
              {
                keywords: ["pagamento", "pagar", "formas"],
                reply: "\u{1F4B3} Aceitamos: PIX, Cartao de Credito, Boleto e Transferencia Bancaria."
              },
              {
                keywords: ["cancelar", "cancelamento", "devolver"],
                reply: "\u{1F504} Voce pode cancelar a qualquer momento. Entre em contato com nosso suporte digitando 'atendente'."
              }
            ],
            default_reply: "Nao encontrei resposta para sua duvida. Digite 'atendente' para falar com nosso time.",
            pause_bot_after_reply: false
          },
          logicType: "json"
        },
        {
          id: "template_welcome_complete",
          name: "Boas-Vindas Completo",
          category: "Atendimento",
          description: "Mensagem de boas-vindas com menu integrado.",
          logic: {
            rules: [
              {
                keywords: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "inicio", "comecar"],
                reply: "Ola! \u{1F44B} Bem-vindo(a)!\n\n\u{1F4CB} *Como posso ajudar?*\n\n1\uFE0F\u20E3 Ver Produtos\n2\uFE0F\u20E3 Fazer Pedido\n3\uFE0F\u20E3 Suporte\n4\uFE0F\u20E3 Rastrear Pedido\n\nDigite o numero da opcao."
              }
            ],
            default_reply: "Digite 'oi' para comecar!",
            pause_bot_after_reply: false
          },
          logicType: "json"
        }
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching logic templates:", error);
      res.status(500).json({ message: "Failed to fetch logic templates" });
    }
  });
  app2.get("/api/admin/system-logs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const { category, level, deviceId, limit } = req.query;
      const logs = await storage.getSystemLogs({
        category,
        level,
        deviceId,
        limit: limit ? parseInt(limit) : 100
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  });
  app2.post("/api/admin/promote", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { secret } = req.body;
      if (secret !== "admin123") {
        return res.status(403).json({ message: "Invalid secret" });
      }
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, { isAdmin: true });
        res.json({ message: "User promoted to admin", user: { ...user, isAdmin: true } });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const [allUsers, allDevices] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllDevices()
      ]);
      const devicesByUser = /* @__PURE__ */ new Map();
      for (const device of allDevices) {
        if (!devicesByUser.has(device.userId)) {
          devicesByUser.set(device.userId, []);
        }
        devicesByUser.get(device.userId).push(device);
      }
      const usersWithDevices = allUsers.map((u) => {
        const devices = devicesByUser.get(u.id) || [];
        const connectedDevices = devices.filter(
          (d) => getWhatsAppSessionStatus(d.id) === "READY"
        ).length;
        return {
          ...u,
          deviceCount: devices.length,
          connectedDevices
        };
      });
      res.json(usersWithDevices);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const allUsers = await storage.getAllUsers();
      const allDevices = await storage.getAllDevices();
      const connectedDevices = allDevices.filter(
        (d) => getWhatsAppSessionStatus(d.id) === "READY"
      ).length;
      const freeUsers = allUsers.filter((u) => u.currentPlan === "free").length;
      const basicUsers = allUsers.filter((u) => u.currentPlan === "basic").length;
      const fullUsers = allUsers.filter((u) => u.currentPlan === "full").length;
      const activeSubscriptions = allUsers.filter(
        (u) => u.currentPlan !== "free" && u.stripeSubscriptionId
      ).length;
      const messagesLast24h = 0;
      res.json({
        totalUsers: allUsers.length,
        activeSubscriptions,
        freeUsers,
        basicUsers,
        fullUsers,
        totalRevenue: 0,
        // TODO: calculate from Stripe
        totalDevices: allDevices.length,
        connectedDevices,
        messagesLast24h
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.post("/api/admin/users/:userId/update-plan", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const { userId } = req.params;
      const { plan } = req.body;
      if (!["free", "basic", "full"].includes(plan)) {
        return res.status(400).json({ message: "Plano inv\xE1lido" });
      }
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const planExpiresAt = plan === "free" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
      await storage.updateUser(userId, {
        currentPlan: plan,
        planExpiresAt
      });
      res.json({ message: "Plano atualizado com sucesso" });
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });
  app2.delete("/api/admin/users/:userId", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const { userId } = req.params;
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (targetUser.isAdmin) {
        return res.status(403).json({ message: "N\xE3o \xE9 poss\xEDvel deletar outro administrador" });
      }
      const devices = await storage.getDevices(userId);
      for (const device of devices) {
        await destroyWhatsAppSession(device.id);
        await storage.deleteDevice(device.id);
      }
      await storage.deleteUser(userId);
      res.json({ message: "Usu\xE1rio deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const sessions3 = getAllSessionsInfo();
      const counts = getActiveSessionCount();
      res.json({ sessions: sessions3, counts });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  app2.post("/api/admin/sessions/:deviceId/stop", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const { deviceId } = req.params;
      const result = await forceCleanupSession(deviceId);
      await storage.updateDevice(deviceId, { connectionStatus: "disconnected" });
      res.json(result);
    } catch (error) {
      console.error("Error stopping session:", error);
      res.status(500).json({ message: "Failed to stop session" });
    }
  });
  app2.post("/api/admin/sessions/cleanup", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado: apenas administradores" });
      }
      const result = await cleanupOrphanSessions();
      res.json({ message: `Limpeza conclu\xEDda: ${result.cleaned} sess\xF5es limpas, ${result.errors} erros`, ...result });
    } catch (error) {
      console.error("Error cleaning sessions:", error);
      res.status(500).json({ message: "Failed to cleanup sessions" });
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user && !user.isAdmin && user.currentPlan === "free" && user.planExpiresAt) {
        const now = /* @__PURE__ */ new Date();
        if (now > new Date(user.planExpiresAt)) {
        }
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/devices", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getDevices(userId);
      const devicesWithStatus = devices.map((device) => {
        const rawStatus = getWhatsAppSessionStatus(device.id);
        const qrCode = getWhatsAppQRCode(device.id);
        let status = device.connectionStatus;
        if (rawStatus === "READY") status = "connected";
        else if (rawStatus === "QR_PENDING") status = "qr_ready";
        else if (rawStatus === "INITIALIZING") status = "connecting";
        else if (rawStatus === "DISCONNECTED") status = "disconnected";
        return {
          ...device,
          connectionStatus: status,
          qrCode: qrCode || device.qrCode
        };
      });
      res.json(devicesWithStatus);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });
  app2.post("/api/devices", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const existingDevices = await storage.getDevices(userId);
      const maxDevices = user?.isAdmin ? 999 : user?.currentPlan === "free" ? 1 : user?.currentPlan === "basic" ? 2 : 999;
      if (existingDevices.length >= maxDevices) {
        return res.status(403).json({
          message: `Seu plano permite apenas ${maxDevices} dispositivo(s). Fa\xE7a upgrade para adicionar mais.`
        });
      }
      const data = insertWhatsappDeviceSchema.parse({
        ...req.body,
        userId
      });
      const device = await storage.createDevice(data);
      createWhatsAppSession(device.id).catch((error) => {
        console.error("Error creating WhatsApp session:", error);
      });
      res.json(device);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });
  app2.post("/api/devices/:id/reconnect", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this device" });
      }
      await destroyWhatsAppSession(device.id);
      createWhatsAppSession(device.id).catch((error) => {
        console.error("Error reconnecting WhatsApp session:", error);
      });
      res.json(device);
    } catch (error) {
      console.error("Error reconnecting device:", error);
      res.status(500).json({ message: "Failed to reconnect device" });
    }
  });
  app2.get("/api/devices/:id/qrcode", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this device" });
      }
      const qrCode = getWhatsAppQRCode(req.params.id);
      const status = getWhatsAppSessionStatus(req.params.id);
      res.json({ qrCode, status });
    } catch (error) {
      console.error("Error getting QR code:", error);
      res.status(500).json({ message: "Failed to get QR code" });
    }
  });
  app2.delete("/api/devices/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.id);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ message: "Device not found" });
      }
      await destroyWhatsAppSession(req.params.id);
      await storage.deleteDevice(req.params.id);
      res.json({ message: "Device deleted" });
    } catch (error) {
      console.error("Error deleting device:", error);
      res.status(500).json({ message: "Failed to delete device" });
    }
  });
  app2.post("/api/devices/:id/set-logic", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this device" });
      }
      const { logicId } = req.body;
      if (logicId) {
        const logic = await storage.getLogic(logicId);
        if (!logic || logic.userId !== userId) {
          return res.status(403).json({ message: "Logic not found or not owned by user" });
        }
      }
      const updated = await storage.updateDevice(req.params.id, {
        activeLogicId: logicId || null
      });
      res.json(updated);
    } catch (error) {
      console.error("Error setting logic:", error);
      res.status(500).json({ message: "Failed to set logic" });
    }
  });
  app2.post("/api/devices/:id/toggle-pause", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this device" });
      }
      const updated = await storage.updateDevice(req.params.id, {
        isPaused: !device.isPaused
      });
      res.json(updated);
    } catch (error) {
      console.error("Error toggling pause:", error);
      res.status(500).json({ message: "Failed to toggle pause" });
    }
  });
  app2.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getDevices(userId);
      const allConversations = await Promise.all(
        devices.map((device) => storage.getConversations(device.id))
      );
      const conversations2 = allConversations.flat();
      res.json(conversations2);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });
  app2.get("/api/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
    try {
      const messages2 = await storage.getMessages(req.params.conversationId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      const device = await storage.getDevice(conversation.deviceId);
      if (!device || device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized device access" });
      }
      if (device.connectionStatus !== "connected") {
        return res.status(400).json({ message: "Device not connected to WhatsApp" });
      }
      const data = insertMessageSchema.parse({
        content,
        conversationId,
        direction: "outgoing",
        isFromBot: false,
        timestamp: /* @__PURE__ */ new Date()
      });
      const message = await storage.createMessage(data);
      try {
        await sendWhatsAppMessage(
          conversation.deviceId,
          conversation.contactPhone,
          content
        );
      } catch (sendError) {
        console.error("Failed to send WhatsApp message:", sendError);
        return res.status(500).json({ message: "Failed to send message to WhatsApp network", error: sendError.message });
      }
      res.json(message);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  app2.get("/api/logics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const logics = await storage.getLogics(userId);
      res.json(logics);
    } catch (error) {
      console.error("Error fetching logics:", error);
      res.status(500).json({ message: "Failed to fetch logics" });
    }
  });
  app2.get("/api/logics/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const logic = await storage.getLogic(req.params.id);
      if (!logic) {
        return res.status(404).json({ message: "Logic not found" });
      }
      if (logic.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this logic" });
      }
      res.json(logic);
    } catch (error) {
      console.error("Error fetching logic:", error);
      res.status(500).json({ message: "Failed to fetch logic" });
    }
  });
  app2.post("/api/logics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.currentPlan === "free") {
        const existingLogics = await storage.getLogics(userId);
        if (existingLogics.length >= 1) {
          return res.status(403).json({
            message: "Plano Free permite apenas 1 l\xF3gica. Fa\xE7a upgrade para criar mais."
          });
        }
      }
      const data = insertLogicConfigSchema.parse({
        ...req.body,
        userId,
        // Ensure logicType defaults to 'json' if not provided
        logicType: req.body.logicType || "json"
      });
      if (data.logicType === "ai" && user.currentPlan !== "full") {
        return res.status(403).json({
          message: "L\xF3gicas com IA Gemini dispon\xEDveis apenas no plano Full. Fa\xE7a upgrade para acessar este recurso."
        });
      }
      const logic = await storage.createLogic(data);
      res.json(logic);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating logic:", error);
      res.status(500).json({ message: "Failed to create logic" });
    }
  });
  app2.patch("/api/logics/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const logic = await storage.getLogic(req.params.id);
      if (!logic) {
        return res.status(404).json({ message: "Logic not found" });
      }
      if (logic.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this logic" });
      }
      const finalLogicType = req.body.logicType !== void 0 ? req.body.logicType : logic.logicType;
      if (finalLogicType === "ai") {
        const user = await storage.getUser(userId);
        if (!user || user.currentPlan !== "full") {
          return res.status(403).json({
            message: "L\xF3gicas com IA Gemini dispon\xEDveis apenas no plano Full. Fa\xE7a upgrade para acessar este recurso."
          });
        }
      }
      const updated = await storage.updateLogic(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating logic:", error);
      res.status(500).json({ message: "Failed to update logic" });
    }
  });
  app2.delete("/api/logics/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const logic = await storage.getLogic(req.params.id);
      if (!logic || logic.userId !== userId) {
        return res.status(404).json({ message: "Logic not found" });
      }
      await storage.deleteLogic(req.params.id);
      res.json({ message: "Logic deleted" });
    } catch (error) {
      console.error("Error deleting logic:", error);
      res.status(500).json({ message: "Failed to delete logic" });
    }
  });
  app2.post("/api/ai/generate-logic", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(403).json({
          message: "Usu\xE1rio n\xE3o autenticado"
        });
      }
      const ai = getAI2(user.geminiApiKey);
      if (!ai) {
        return res.status(503).json({ message: "Gemini AI not configured - missing API key" });
      }
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      const systemPrompt = `Voc\xEA \xE9 um especialista em criar l\xF3gicas de chatbot para WhatsApp.
Sua tarefa \xE9 criar um JSON robusto e completo baseado na solicita\xE7\xE3o do usu\xE1rio.

Estrutura do JSON:
{
  "rules": [
    {
      "keywords": ["palavra1", "palavra2"],
      "reply": "Resposta do bot"
    }
  ],
  "default_reply": "Mensagem enviada se nenhuma regra for correspondida (opcional)",
  "pause_bot_after_reply": false
}

Diretrizes para uma l\xF3gica ROBUSTA:
1. Crie regras abrangentes para sauda\xE7\xF5es (oi, ol\xE1, bom dia).
2. Se o usu\xE1rio pedir um fluxo de vendas, inclua regras para pre\xE7os, formas de pagamento e entrega.
3. Se for suporte, inclua regras para hor\xE1rio de atendimento e d\xFAvidas comuns.
4. Use emojis para tornar as respostas amig\xE1veis.
5. Sempre inclua varia\xE7\xF5es de keywords (ex: "pre\xE7o", "valor", "quanto custa").

Responda APENAS com o JSON v\xE1lido.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents: prompt
      });
      const text2 = response.text || "{}";
      const cleanText = text2.replace(/```json\n?|\n?```/g, "").trim();
      const generatedJson = JSON.parse(cleanText || "{}");
      res.json({ logicJson: generatedJson });
    } catch (error) {
      console.error("Error generating logic with AI:", error);
      res.status(500).json({ message: "Failed to generate logic" });
    }
  });
  app2.post("/api/ai/generate-and-save-logic", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(403).json({
          message: "Usu\xE1rio n\xE3o autenticado"
        });
      }
      const ai = getAI2(user.geminiApiKey);
      if (!ai) {
        return res.status(503).json({ message: "Gemini AI not configured - missing API key" });
      }
      const { prompt, logicName } = req.body;
      if (!prompt || !logicName) {
        return res.status(400).json({ message: "Prompt and logicName are required" });
      }
      const systemPrompt = `Voc\xEA \xE9 um especialista em criar l\xF3gicas de chatbot para WhatsApp.
Sua tarefa \xE9 criar um JSON robusto e completo baseado na solicita\xE7\xE3o do usu\xE1rio.

Estrutura do JSON:
{
  "rules": [
    {
      "keywords": ["palavra1", "palavra2"],
      "reply": "Resposta do bot"
    }
  ],
  "default_reply": "Mensagem enviada se nenhuma regra for correspondida (opcional)",
  "pause_bot_after_reply": false
}

Diretrizes para uma l\xF3gica ROBUSTA:
1. Crie regras abrangentes para sauda\xE7\xF5es (oi, ol\xE1, bom dia).
2. Se o usu\xE1rio pedir um fluxo de vendas, inclua regras para pre\xE7os, formas de pagamento e entrega.
3. Se for suporte, inclua regras para hor\xE1rio de atendimento e d\xFAvidas comuns.
4. Use emojis para tornar as respostas amig\xE1veis.
5. Sempre inclua varia\xE7\xF5es de keywords (ex: "pre\xE7o", "valor", "quanto custa").

Responda APENAS com o JSON v\xE1lido.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents: prompt
      });
      const generatedJson = JSON.parse(response.text || "{}");
      const newLogic = await storage.createLogic({
        userId,
        name: logicName,
        description: `Gerada por IA baseada em: ${prompt.substring(0, 100)}...`,
        logicJson: generatedJson,
        logicType: "ai",
        isActive: false
      });
      res.json({
        message: "L\xF3gica gerada e salva com sucesso",
        logic: newLogic
      });
    } catch (error) {
      console.error("Error generating and saving logic:", error);
      res.status(500).json({ message: "Failed to generate and save logic" });
    }
  });
  app2.post("/api/generate-art", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const ai = getAI2(user?.geminiApiKey);
      if (!ai) {
        return res.status(400).json({ message: "Gemini API n\xE3o configurada" });
      }
      const {
        materialType,
        visualStyle,
        primaryColor,
        accentColor,
        businessType,
        businessName,
        customPrompt,
        productsList
      } = req.body;
      const materialNames = {
        "menu-a4": "card\xE1pio formato A4",
        "flyer": "panfleto promocional",
        "social": "post para Instagram/WhatsApp quadrado",
        "banner": "banner para loja"
      };
      const styleNames = {
        "modern": "moderno, clean e minimalista",
        "classic": "cl\xE1ssico e elegante",
        "minimalist": "minimalista e simples",
        "vibrant": "vibrante com cores fortes"
      };
      const businessNames = {
        "pizzaria": "pizzaria",
        "hamburgueria": "hamburgueria",
        "cafeteria": "cafeteria",
        "loja": "loja",
        "salao": "sal\xE3o de beleza",
        "academia": "academia",
        "servicos": "empresa de servi\xE7os",
        "restaurante": "restaurante"
      };
      const prompt = `Crie um prompt detalhado para gerar uma imagem de ${materialNames[materialType] || "arte promocional"} para ${businessNames[businessType] || "neg\xF3cio"} chamado "${businessName}".

Especifica\xE7\xF5es:
- Estilo visual: ${styleNames[visualStyle] || "moderno"}
- Cor principal: ${primaryColor}
- Cor de acento: ${accentColor}
${productsList ? `- Produtos/Itens para incluir:
${productsList}` : ""}
${customPrompt ? `- Instru\xE7\xF5es especiais: ${customPrompt}` : ""}

Gere um prompt em ingl\xEAs, detalhado e profissional, que pode ser usado em ferramentas de gera\xE7\xE3o de imagem como DALL-E ou Midjourney. O prompt deve descrever:
1. O layout e composi\xE7\xE3o
2. As cores e estilo visual
3. Os elementos gr\xE1ficos necess\xE1rios
4. O texto/tipografia a incluir
5. A atmosfera e mood geral

Responda APENAS com o prompt, sem explica\xE7\xF5es adicionais.`;
      const model = ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      const response = await model;
      const generatedPrompt = response.text?.trim() || "";
      res.json({
        prompt: generatedPrompt,
        message: "Prompt gerado com sucesso. Use-o em uma ferramenta de gera\xE7\xE3o de imagens."
      });
    } catch (error) {
      console.error("Error generating art prompt:", error);
      res.status(500).json({ message: "Erro ao gerar prompt de arte" });
    }
  });
  if (stripe) {
    app2.post("/api/create-checkout-session", isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const { plan } = req.query;
        if (!user?.email) {
          return res.status(400).json({ message: "User email required" });
        }
        const STRIPE_PRICE_BASIC = process.env.STRIPE_PRICE_BASIC;
        const STRIPE_PRICE_FULL = process.env.STRIPE_PRICE_FULL;
        if (!STRIPE_PRICE_BASIC || !STRIPE_PRICE_FULL) {
          console.warn("\u26A0\uFE0F WARNING: STRIPE_PRICE_BASIC and STRIPE_PRICE_FULL not configured. Using inline prices (not recommended for production).");
        }
        if (!plan || plan !== "basic" && plan !== "full") {
          return res.status(400).json({ message: "Invalid plan. Must be 'basic' or 'full'" });
        }
        const session2 = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              // If Stripe Price IDs are configured, use them. Otherwise create price inline.
              ...STRIPE_PRICE_BASIC && plan === "basic" ? { price: STRIPE_PRICE_BASIC, quantity: 1 } : STRIPE_PRICE_FULL && plan === "full" ? { price: STRIPE_PRICE_FULL, quantity: 1 } : {
                price_data: {
                  currency: "brl",
                  product_data: {
                    name: `Plano ${plan === "basic" ? "B\xE1sico" : "Full"}`,
                    description: `Assinatura mensal ChatBot Host`
                  },
                  unit_amount: plan === "basic" ? 2990 : 9900,
                  // R$ 29.90 or R$ 99.00
                  recurring: {
                    interval: "month"
                  }
                },
                quantity: 1
              }
            }
          ],
          mode: "subscription",
          customer_email: user.email,
          success_url: `${req.protocol}://${req.get("host")}/billing?success=true`,
          cancel_url: `${req.protocol}://${req.get("host")}/billing?canceled=true`,
          metadata: {
            userId,
            plan
          }
        });
        res.json({ url: session2.url });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
      }
    });
    app2.post("/api/stripe/webhook", async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      let event;
      try {
        if (!sig || !webhookSecret) {
          console.warn("Webhook signature or secret missing");
          if (!webhookSecret && process.env.NODE_ENV !== "production") {
            console.warn("\u26A0\uFE0F Using insecure webhook handling (Development Mode)");
            event = req.body;
          } else {
            return res.status(400).send(`Webhook Error: Missing signature or secret`);
          }
        } else {
          event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        }
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      try {
        if (event.type === "checkout.session.completed") {
          const session2 = event.data.object;
          const { userId, plan } = session2.metadata || {};
          if (userId && plan) {
            const user = await storage.getUser(userId);
            if (user) {
              await storage.upsertUser({
                ...user,
                currentPlan: plan,
                planExpiresAt: null,
                // Subscription doesn't expire unless cancelled
                stripeCustomerId: session2.customer,
                stripeSubscriptionId: session2.subscription
              });
              console.log(`User ${userId} upgraded to plan ${plan}`);
            }
          }
        }
        res.json({ received: true });
      } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(400).send(`Webhook Error: ${error}`);
      }
    });
  }
  app2.get("/api/knowledge", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getKnowledgeBase(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });
  app2.get("/api/knowledge/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const item = await storage.getKnowledgeBaseItem(id);
      if (!item) {
        return res.status(404).json({ message: "Knowledge base item not found" });
      }
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching knowledge base item:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base item" });
    }
  });
  app2.post("/api/knowledge", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, content, category, imageUrls, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      const item = await storage.createKnowledgeBase({
        userId,
        title,
        content,
        category,
        imageUrls,
        tags,
        isActive: true
      });
      res.json(item);
    } catch (error) {
      console.error("Error creating knowledge base item:", error);
      res.status(500).json({ message: "Failed to create knowledge base item" });
    }
  });
  app2.post("/api/knowledge/scrape", isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ]
      });
      const page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
      await page.goto(url, { waitUntil: "networkidle2", timeout: 3e4 });
      const data = await page.evaluate(() => {
        const title = document.title;
        const scripts = document.querySelectorAll("script, style");
        scripts.forEach((s) => s.remove());
        const content = document.body.innerText.replace(/\s+/g, " ").trim().substring(0, 5e3);
        return { title, content };
      });
      await browser.close();
      res.json(data);
    } catch (error) {
      console.error("Error scraping URL:", error);
      res.status(500).json({ message: "Failed to scrape URL. Make sure it is accessible." });
    }
  });
  app2.patch("/api/knowledge/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const item = await storage.getKnowledgeBaseItem(id);
      if (!item) {
        return res.status(404).json({ message: "Knowledge base item not found" });
      }
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const updated = await storage.updateKnowledgeBase(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating knowledge base item:", error);
      res.status(500).json({ message: "Failed to update knowledge base item" });
    }
  });
  app2.delete("/api/knowledge/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const item = await storage.getKnowledgeBaseItem(id);
      if (!item) {
        return res.status(404).json({ message: "Knowledge base item not found" });
      }
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await storage.deleteKnowledgeBase(id);
      res.json({ message: "Knowledge base item deleted successfully" });
    } catch (error) {
      console.error("Error deleting knowledge base item:", error);
      res.status(500).json({ message: "Failed to delete knowledge base item" });
    }
  });
  app2.get("/api/bot-behaviors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const behaviors = await storage.getBotBehaviors(userId);
      const presets = await storage.getPresetBehaviors();
      res.json([...behaviors, ...presets]);
    } catch (error) {
      console.error("Error fetching bot behaviors:", error);
      res.status(500).json({ message: "Failed to fetch bot behaviors" });
    }
  });
  app2.get("/api/bot-behaviors/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const behavior = await storage.getBotBehavior(id);
      if (!behavior) {
        return res.status(404).json({ message: "Bot behavior not found" });
      }
      if (!behavior.isPreset && behavior.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(behavior);
    } catch (error) {
      console.error("Error fetching bot behavior:", error);
      res.status(500).json({ message: "Failed to fetch bot behavior" });
    }
  });
  app2.post("/api/logics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, logicJson, logicType, behaviorConfigId, aiPrompt } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const logic = await storage.createLogic({
        userId,
        name,
        description,
        logicJson: logicJson || {},
        logicType: logicType || "json",
        behaviorConfigId,
        isActive: true,
        isTemplate: false
      });
      if (logicType === "hybrid" && aiPrompt) {
        const logicDir = path4.join(process.cwd(), "server", "data", "logics", logic.id);
        if (!fs4.existsSync(logicDir)) {
          fs4.mkdirSync(logicDir, { recursive: true });
        }
        fs4.writeFileSync(path4.join(logicDir, "ia-prompt.txt"), aiPrompt, "utf8");
      }
      res.json(logic);
    } catch (error) {
      console.error("Error creating logic:", error);
      res.status(500).json({ message: "Failed to create logic" });
    }
  });
  app2.patch("/api/logics/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { logicJson, aiPrompt } = req.body;
      const logic = await storage.getLogic(id);
      if (!logic) {
        return res.status(404).json({ message: "Logic not found" });
      }
      if (logic.isTemplate) {
        return res.status(403).json({ message: "Cannot edit template logics" });
      }
      if (logic.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const updated = await storage.updateLogic(id, req.body);
      if (updated.logicType === "hybrid" && aiPrompt !== void 0) {
        const logicDir = path4.join(process.cwd(), "server", "data", "logics", id);
        if (!fs4.existsSync(logicDir)) {
          fs4.mkdirSync(logicDir, { recursive: true });
        }
        fs4.writeFileSync(path4.join(logicDir, "ia-prompt.txt"), aiPrompt, "utf8");
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating logic:", error);
      res.status(500).json({ message: "Failed to update logic" });
    }
  });
  app2.post("/api/bot-behaviors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, tone, personality, responseStyle, customInstructions } = req.body;
      if (!name || !personality) {
        return res.status(400).json({ message: "Name and personality are required" });
      }
      const behavior = await storage.createBotBehavior({
        userId,
        name,
        tone: tone || "professional",
        personality,
        responseStyle: responseStyle || "concise",
        customInstructions,
        isActive: true,
        isPreset: false
      });
      res.json(behavior);
    } catch (error) {
      console.error("Error creating bot behavior:", error);
      res.status(500).json({ message: "Failed to create bot behavior" });
    }
  });
  app2.patch("/api/bot-behaviors/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const behavior = await storage.getBotBehavior(id);
      if (!behavior) {
        return res.status(404).json({ message: "Bot behavior not found" });
      }
      if (behavior.isPreset) {
        return res.status(403).json({ message: "Cannot edit preset behaviors" });
      }
      if (behavior.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const updated = await storage.updateBotBehavior(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating bot behavior:", error);
      res.status(500).json({ message: "Failed to update bot behavior" });
    }
  });
  app2.delete("/api/bot-behaviors/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const behavior = await storage.getBotBehavior(id);
      if (!behavior) {
        return res.status(404).json({ message: "Bot behavior not found" });
      }
      if (behavior.isPreset) {
        return res.status(403).json({ message: "Cannot delete preset behaviors" });
      }
      if (behavior.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await storage.deleteBotBehavior(id);
      res.json({ message: "Bot behavior deleted successfully" });
    } catch (error) {
      console.error("Error deleting bot behavior:", error);
      res.status(500).json({ message: "Failed to delete bot behavior" });
    }
  });
  app2.get("/api/broadcasts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const broadcasts2 = await storage.getBroadcasts(userId);
      res.json(broadcasts2);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });
  app2.post("/api/broadcasts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, deviceId, message, contacts, mediaUrl, mediaType, mediaUrls, mediaTypes, delay } = req.body;
      console.log(`[Broadcast] Creating broadcast. Contacts payload type: ${typeof contacts}, IsArray: ${Array.isArray(contacts)}, Length: ${contacts?.length}`);
      console.log(`[Broadcast] Media: mediaUrls=${mediaUrls?.length || 0}, mediaUrl=${mediaUrl ? "yes" : "no"}`);
      if (Array.isArray(contacts) && contacts.length > 0) {
        console.log(`[Broadcast] First contact sample:`, contacts[0]);
      }
      if (!name || !deviceId || !message || !contacts || !Array.isArray(contacts)) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== userId) {
        return res.status(403).json({ message: "Device not found or unauthorized" });
      }
      const validContacts = contacts.filter((c) => {
        if (!c || typeof c !== "string") return false;
        const clean = c.replace(/\D/g, "");
        return clean.length >= 8;
      });
      console.log(`[Broadcast] Valid contacts found: ${validContacts.length}`);
      if (validContacts.length === 0) {
        return res.status(400).json({ message: "No valid contacts provided" });
      }
      const broadcast = await storage.createBroadcast({
        userId,
        deviceId,
        name,
        message,
        mediaUrl: mediaUrl || (mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : null),
        mediaType: mediaType || (mediaTypes && mediaTypes.length > 0 ? mediaTypes[0] : null),
        mediaUrls: mediaUrls || (mediaUrl ? [mediaUrl] : null),
        mediaTypes: mediaTypes || (mediaType ? [mediaType] : null),
        delay: delay || 20,
        status: "pending",
        totalContacts: validContacts.length,
        sentCount: 0,
        failedCount: 0
      });
      for (const phone of validContacts) {
        await storage.createBroadcastContact({
          broadcastId: broadcast.id,
          contactName: phone,
          contactPhone: phone,
          status: "pending"
        });
      }
      res.json(broadcast);
    } catch (error) {
      console.error("Error creating broadcast:", error);
      res.status(500).json({ message: "Failed to create broadcast" });
    }
  });
  app2.post("/api/broadcasts/:id/start", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const broadcast = await storage.getBroadcast(req.params.id);
      if (!broadcast || broadcast.userId !== userId) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      const updated = await storage.updateBroadcast(req.params.id, {
        status: "running",
        startedAt: /* @__PURE__ */ new Date()
      });
      processBroadcast(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error starting broadcast:", error);
      res.status(500).json({ message: "Failed to start broadcast" });
    }
  });
  app2.post("/api/broadcasts/:id/pause", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const broadcast = await storage.getBroadcast(req.params.id);
      if (!broadcast || broadcast.userId !== userId) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      const updated = await storage.updateBroadcast(req.params.id, {
        status: "paused"
      });
      res.json(updated);
    } catch (error) {
      console.error("Error pausing broadcast:", error);
      res.status(500).json({ message: "Failed to pause broadcast" });
    }
  });
  app2.delete("/api/broadcasts/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const broadcast = await storage.getBroadcast(req.params.id);
      if (!broadcast || broadcast.userId !== userId) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      if (broadcast.status === "running") {
        return res.status(400).json({ message: "Cannot delete running broadcast. Pause it first." });
      }
      await storage.deleteBroadcast(req.params.id);
      res.json({ message: "Broadcast deleted" });
    } catch (error) {
      console.error("Error deleting broadcast:", error);
      res.status(500).json({ message: "Failed to delete broadcast" });
    }
  });
  app2.get("/api/whatsapp/contacts/:deviceId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.deviceId);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.connectionStatus !== "connected") {
        return res.status(400).json({ message: "Device not connected" });
      }
      const includeGroups = req.query.includeGroups === "true";
      const contacts = await getWhatsAppContacts(req.params.deviceId, includeGroups);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });
  app2.post("/api/whatsapp/sync-contacts/:deviceId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const device = await storage.getDevice(req.params.deviceId);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.connectionStatus !== "connected") {
        return res.status(400).json({ message: "Device not connected" });
      }
      const success = await syncContacts(req.params.deviceId);
      if (success) {
        res.json({ message: "Contatos sincronizados com sucesso" });
      } else {
        res.status(500).json({ message: "Falha ao sincronizar contatos" });
      }
    } catch (error) {
      console.error("Error syncing contacts:", error);
      res.status(500).json({ message: "Failed to sync contacts" });
    }
  });
  app2.get("/api/whatsapp/contacts/:deviceId/:contactId/pic", isAuthenticated, async (req, res) => {
    try {
      const { deviceId, contactId } = req.params;
      const picUrl = await getContactProfilePic(deviceId, contactId);
      res.json({ url: picUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile pic" });
    }
  });
  app2.post("/api/ai/generate-message", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }
      const ai = getAI2(user.geminiApiKey);
      if (!ai) {
        return res.status(503).json({ message: "Gemini AI not configured - missing API key" });
      }
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      const systemPrompt = `Voc\xEA \xE9 um assistente que cria mensagens profissionais para WhatsApp.
Crie uma mensagem curta, clara e atraente baseada no prompt do usu\xE1rio.
A mensagem deve ser amig\xE1vel e adequada para envio em massa.
Responda APENAS com a mensagem, sem aspas ou formata\xE7\xE3o extra.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt
        },
        contents: prompt
      });
      const generatedMessage = response.text || "";
      res.json({ message: generatedMessage });
    } catch (error) {
      console.error("Error generating message with AI:", error);
      res.status(500).json({ message: "Failed to generate message" });
    }
  });
  app2.get("/api/web-assistants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const assistants = await storage.getWebAssistants(userId);
      res.json(assistants);
    } catch (error) {
      console.error("Error fetching web assistants:", error);
      res.status(500).json({ message: "Failed to fetch web assistants" });
    }
  });
  app2.post("/api/web-assistants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertWebAssistantSchema.parse({
        ...req.body,
        userId
      });
      const existing = await storage.getWebAssistantBySlug(data.slug);
      if (existing) {
        return res.status(400).json({ message: "Este link (slug) j\xE1 est\xE1 em uso. Escolha outro." });
      }
      const assistant = await storage.createWebAssistant(data);
      res.json(assistant);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("Error creating web assistant:", error);
      res.status(500).json({ message: "Failed to create web assistant" });
    }
  });
  app2.patch("/api/web-assistants/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const assistant = await storage.getWebAssistant(id);
      if (!assistant || assistant.userId !== userId) {
        return res.status(404).json({ message: "Assistente n\xE3o encontrado" });
      }
      const updated = await storage.updateWebAssistant(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating web assistant:", error);
      res.status(500).json({ message: "Failed to update web assistant" });
    }
  });
  app2.delete("/api/web-assistants/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const assistant = await storage.getWebAssistant(id);
      if (!assistant || assistant.userId !== userId) {
        return res.status(404).json({ message: "Assistente n\xE3o encontrado" });
      }
      await storage.deleteWebAssistant(id);
      res.json({ message: "Assistente removido" });
    } catch (error) {
      console.error("Error deleting web assistant:", error);
      res.status(500).json({ message: "Failed to delete web assistant" });
    }
  });
  app2.get("/api/public/assistants/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const assistant = await storage.getWebAssistantBySlug(slug);
      if (!assistant || !assistant.isActive) {
        return res.status(404).json({ message: "Assistente n\xE3o encontrado ou inativo" });
      }
      res.json({
        name: assistant.name,
        themeColor: assistant.themeColor,
        slug: assistant.slug
      });
    } catch (error) {
      console.error("Error fetching public assistant:", error);
      res.status(500).json({ message: "Failed to fetch assistant" });
    }
  });
  app2.post("/api/public/chat/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { message } = req.body;
      console.log(`[WebChat] Received message for slug: ${slug}, message: ${message}`);
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const assistant = await storage.getWebAssistantBySlug(slug);
      console.log(`[WebChat] Assistant found:`, assistant ? `ID: ${assistant.id}, Active: ${assistant.isActive}, LogicID: ${assistant.activeLogicId}` : "NOT FOUND");
      if (!assistant || !assistant.isActive) {
        return res.status(404).json({ message: "Assistente n\xE3o encontrado" });
      }
      let reply = "";
      let mediaUrl;
      let mediaType;
      let usedAI = false;
      if (!assistant.activeLogicId) {
        console.log(`[WebChat] No logic configured for assistant ${assistant.id}`);
        reply = "Ol\xE1! Este assistente ainda n\xE3o foi configurado. Por favor, configure uma l\xF3gica para come\xE7ar a usar.";
      } else {
        const logic = await storage.getLogic(assistant.activeLogicId);
        console.log(`[WebChat] Logic found:`, logic ? `ID: ${logic.id}, Type: ${logic.logicType}, Active: ${logic.isActive}` : "NOT FOUND");
        if (!logic || !logic.isActive) {
          reply = "Desculpe, a l\xF3gica deste assistente n\xE3o est\xE1 dispon\xEDvel no momento.";
        } else {
          console.log(`[WebChat] Executing logic for ${slug}. Type: ${logic.logicType}`);
          const jsonResult = executeLogic(message, logic.logicJson);
          const defaultReply = logic.logicJson.default_reply || "Desculpe, n\xE3o entendi sua mensagem.";
          const isDefaultReply = jsonResult.reply === defaultReply;
          if (!isDefaultReply) {
            console.log(`[WebChat] JSON Logic matched specific rule: ${jsonResult.reply.substring(0, 20)}...`);
            reply = jsonResult.reply;
            mediaUrl = jsonResult.mediaUrl;
            mediaType = jsonResult.mediaType;
          } else {
            console.log(`[WebChat] JSON Logic returned default reply. Will try AI if enabled.`);
          }
          if (!reply && (logic.logicType === "hybrid" || logic.logicType === "ai")) {
            const user = await storage.getUser(assistant.userId);
            if (user) {
              const ai = getAI2(user.geminiApiKey);
              if (ai) {
                try {
                  const logicDir = path4.join(process.cwd(), "server", "data", "logics", logic.id);
                  let systemInstruction = "Voc\xEA \xE9 um assistente virtual de atendimento via chat web.";
                  if (fs4.existsSync(path4.join(logicDir, "ia-prompt.txt"))) {
                    systemInstruction = fs4.readFileSync(path4.join(logicDir, "ia-prompt.txt"), "utf8");
                  }
                  if (logic.behaviorConfigId) {
                    const behavior = await storage.getBotBehavior(logic.behaviorConfigId);
                    if (behavior) {
                      systemInstruction += `

DIRETRIZES DE PERSONALIDADE:
`;
                      systemInstruction += `Nome: ${behavior.name}
`;
                      systemInstruction += `Tom de voz: ${behavior.tone}
`;
                      systemInstruction += `Personalidade: ${behavior.personality}
`;
                      systemInstruction += `Instru\xE7\xF5es extras: ${behavior.customInstructions}
`;
                    }
                  }
                  if (logic.logicJson) {
                    const logicJson = logic.logicJson;
                    systemInstruction += `

REGRAS DE NEG\xD3CIO E INFORMA\xC7\xD5ES DO SITE (Use estas informa\xE7\xF5es para responder):
`;
                    logicJson.rules.forEach((rule) => {
                      systemInstruction += `- T\xF3picos: "${rule.keywords.join(", ")}". Informa\xE7\xE3o: "${rule.reply}"
`;
                    });
                  }
                  if (fs4.existsSync(path4.join(logicDir, "site-context.txt"))) {
                    const siteContext = fs4.readFileSync(path4.join(logicDir, "site-context.txt"), "utf8");
                    systemInstruction += `

CONTE\xDADO COMPLETO DO SITE (Use para responder perguntas n\xE3o cobertas pelas regras acima):
${siteContext.slice(0, 15e3)}
`;
                  }
                  const knowledgeItems = await storage.getKnowledgeBase(assistant.userId);
                  const activeKnowledge = knowledgeItems.filter((k) => k.isActive);
                  if (activeKnowledge.length > 0) {
                    systemInstruction += `

OUTRAS FONTES DE CONHECIMENTO:
`;
                    activeKnowledge.forEach((item) => {
                      systemInstruction += `
--- ${item.title} ---
${item.content}
`;
                    });
                  }
                  const aiResponse = await ai.models.generateContent({
                    model: "gemini-2.0-flash-exp",
                    config: { systemInstruction },
                    contents: message
                  });
                  reply = aiResponse.text || "";
                  usedAI = true;
                } catch (aiError) {
                  console.error("Error generating AI response for web chat:", aiError);
                }
              }
            }
          }
          if (!reply) {
            reply = logic.logicJson.default_reply || "Desculpe, n\xE3o entendi sua mensagem.";
          }
        }
      }
      if (!reply) {
        reply = "Desculpe, n\xE3o consegui processar sua mensagem no momento.";
      }
      res.json({
        reply,
        mediaUrl,
        mediaType,
        usedAI
      });
    } catch (error) {
      console.error("CRITICAL Error processing web chat message:", error);
      res.status(500).json({
        message: "Failed to process message",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  const httpServer = createServer(app2);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation-${conversationId}`);
    });
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
    });
    socket.on("new-message", (data) => {
      io.to(`conversation-${data.conversationId}`).emit("message-received", data);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  app2.post("/api/user/update", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      const updated = await storage.updateUser(userId, { firstName, lastName });
      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.post("/api/user/gemini-key", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { geminiApiKey } = req.body;
      if (geminiApiKey) {
        try {
          const testAi = new GoogleGenAI2({ apiKey: geminiApiKey });
          await testAi.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: "Test"
          });
        } catch (error) {
          return res.status(400).json({
            message: "Chave API inv\xE1lida. Verifique se a chave est\xE1 correta."
          });
        }
      }
      const updated = await storage.updateUser(userId, { geminiApiKey });
      res.json({
        message: "Chave API salva com sucesso",
        user: updated
      });
    } catch (error) {
      console.error("Error saving Gemini API key:", error);
      res.status(500).json({ message: "Failed to save API key" });
    }
  });
  app2.get("/api/logics/templates", isAuthenticated, (req, res) => {
    res.json(LOGIC_TEMPLATES);
  });
  app2.post("/api/ai/generate-logic", isAuthenticated, async (req, res) => {
    try {
      const { prompt, sourceType, sourceContent } = req.body;
      const ai = getAI2();
      if (!ai) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      let context = "";
      if (sourceType === "url" && sourceContent) {
        let browser;
        try {
          console.log(`[AI] Scraping URL: ${sourceContent}`);
          browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
          });
          const page = await browser.newPage();
          await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
          console.log(`[AI] Navigating to URL...`);
          await page.goto(sourceContent, { waitUntil: "networkidle2", timeout: 3e4 });
          console.log(`[AI] Extracting text content...`);
          context = await page.evaluate(() => document.body.innerText);
          await browser.close();
          context = context.slice(0, 1e4);
          console.log(`[AI] Successfully scraped ${context.length} characters from URL`);
        } catch (e) {
          console.error("[AI] Scraping error:", e.message);
          if (browser) await browser.close().catch(() => {
          });
          return res.status(400).json({
            message: `Erro ao acessar o site: ${e.message}. Verifique se a URL est\xE1 correta e acess\xEDvel.`
          });
        }
      } else if (sourceType === "text") {
        context = sourceContent;
      }
      const systemPrompt = `
        You are an expert chatbot logic generator.
        
        CONTEXT FROM WEBSITE:
        ${context ? context.slice(0, 1e4) : "No website context provided."}
        
        USER REQUEST: ${prompt}
        
        TASK: Create a JSON chatbot configuration for this specific business.
        
        CRITICAL RULES:
        1. You MUST use the "CONTEXT FROM WEBSITE" above to extract:
           - Real company name
           - Real phone numbers and emails
           - Real product names
           - Real address
        
        2. Do NOT create generic rules. Create specific rules based on the website content.
        
        3. If the website lists products, create a rule for "produtos" listing 3-4 specific items found.
        
        4. If the website has contact info, create a rule for "contato" with the real data.
        
        5. Structure the response as valid JSON matching this interface:
        interface LogicJson {
          default_reply: string;
          pause_bot_after_reply?: boolean;
          rules: {
            keywords: string[];
            reply: string;
            pause_bot_after_reply?: boolean;
            mediaUrl?: string;
            mediaType?: 'image' | 'video' | 'audio' | 'document';
          }[];
        }

        Output ONLY valid JSON.
      `;
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: systemPrompt
      });
      const text2 = result.text || "";
      const jsonStr = text2.replace(/```json/g, "").replace(/```/g, "").trim();
      const logicJson = JSON.parse(jsonStr);
      res.json(logicJson);
    } catch (error) {
      console.error("AI Logic Generation error:", error);
      res.status(500).json({ message: "Failed to generate logic" });
    }
  });
  app2.post("/api/ai/edit-logic", isAuthenticated, async (req, res) => {
    try {
      const { currentJson, prompt, sourceType, sourceContent, useEmojis } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ai = getAI2(user?.geminiApiKey);
      if (!ai) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      let context = "";
      if (sourceType === "url" && sourceContent) {
        let browser;
        try {
          console.log(`[AI Edit] Scraping URL: ${sourceContent}`);
          browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
          });
          const page = await browser.newPage();
          await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
          await page.goto(sourceContent, { waitUntil: "networkidle2", timeout: 3e4 });
          context = await page.evaluate(() => document.body.innerText);
          await browser.close();
          context = context.slice(0, 1e4);
          console.log(`[AI Edit] Successfully scraped ${context.length} characters`);
        } catch (e) {
          console.error("[AI Edit] Scraping error:", e.message);
          if (browser) await browser.close().catch(() => {
          });
        }
      } else if (sourceType === "text") {
        context = sourceContent;
      }
      const systemPrompt = `
        Voc\xEA \xE9 um Arquiteto S\xEAnior de Chatbots (AI Bot Architect).
        Sua miss\xE3o \xE9 garantir que a l\xF3gica do chatbot seja PERFEITA, robusta e \xE0 prova de falhas.
        
        CONTEXTO ADICIONAL (Site/Texto):
        ${context ? context.slice(0, 1e4) : "Nenhum contexto externo fornecido."}
        
        L\xD3GICA ATUAL DO CHATBOT:
        ${JSON.stringify(currentJson, null, 2)}

        SOLICITA\xC7\xC3O DO USU\xC1RIO (CLIENTE FINAL): ${prompt}
        
        PREFER\xCANCIA DE EMOJIS: ${useEmojis ? "Sim, use emojis para tornar as respostas amig\xE1veis." : "N\xE3o, mantenha o tom formal sem emojis."}
        
        SUAS DIRETRIZES DE "ARQUITETO S\xCANIOR":
        1. **INTERPRETA\xC7\xC3O DE INTEN\xC7\xC3O:** O usu\xE1rio final pode n\xE3o saber termos t\xE9cnicos. Se ele disser "o bot travou", verifique se falta um loop de volta ao menu. Se ele disser "n\xE3o acha o produto", verifique as keywords.
        2. **CORRE\xC7\xC3O PROATIVA:** N\xE3o fa\xE7a apenas o que foi pedido. Se voc\xEA ver um erro \xF3bvio na l\xF3gica (ex: um menu sem op\xE7\xE3o de voltar, ou uma regra sem resposta), CORRIJA-O silenciosamente.
        3. **PRESERVA\xC7\xC3O INTELIGENTE:** Nunca apague o trabalho duro do cliente (produtos, textos longos) a menos que seja explicitamente para substituir.
        4. **ENRIQUECIMENTO DE DADOS:** Use o contexto (site) para preencher lacunas. Se o cliente pedir "adicione contato", busque o telefone real no contexto.
        
        INTERFACE OBRIGAT\xD3RIA (JSON):
        interface LogicJson {
          default_reply: string;
          pause_bot_after_reply?: boolean;
          rules: {
            keywords: string[];
            reply: string;
            pause_bot_after_reply?: boolean;
            mediaUrl?: string; // URL da imagem/v\xEDdeo se houver
            mediaType?: 'image' | 'video' | 'audio' | 'document';
            set_conversation_state?: string; // Opcional, para fluxos complexos
          }[];
        }

        Responda APENAS com o JSON v\xE1lido e formatado.
      `;
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents: "Gere o JSON atualizado."
      });
      const text2 = result.text || "";
      const jsonStr = text2.replace(/```json/g, "").replace(/```/g, "").trim();
      const logicJson = JSON.parse(jsonStr);
      res.json({ logicJson });
    } catch (error) {
      console.error("AI Logic Edit error:", error);
      res.status(500).json({ message: "Failed to edit logic" });
    }
  });
  app2.post("/api/ai/generate-and-save-logic", isAuthenticated, async (req, res) => {
    try {
      const { prompt, logicName, sourceType, sourceContent, useEmojis } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ai = getAI2(user?.geminiApiKey);
      if (!ai) return res.status(503).json({ message: "AI service not configured" });
      let context = "";
      if (sourceType === "url" && sourceContent) {
        let browser;
        try {
          console.log(`[AI Save] Scraping URL: ${sourceContent}`);
          browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
          });
          const page = await browser.newPage();
          await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
          await page.goto(sourceContent, { waitUntil: "networkidle2", timeout: 3e4 });
          context = await page.evaluate(() => document.body.innerText);
          await browser.close();
          context = context.slice(0, 1e4);
          console.log(`[AI Save] Successfully scraped ${context.length} characters`);
        } catch (e) {
          console.error("[AI Save] Scraping error:", e.message);
          if (browser) await browser.close().catch(() => {
          });
          return res.status(400).json({
            message: `Erro ao acessar o site: ${e.message}. Verifique se a URL est\xE1 correta e acess\xEDvel.`
          });
        }
      } else if (sourceType === "text") {
        context = sourceContent;
      }
      const systemPrompt = `
        Voc\xEA \xE9 um especialista em criar l\xF3gicas de chatbot em JSON para empresas brasileiras.
        
        CONTEXTO DO SITE/TEXTO:
        ${context ? context.slice(0, 1e4) : "Nenhum contexto fornecido."}
        
        SOLICITA\xC7\xC3O DO USU\xC1RIO: ${prompt}
        
        PREFER\xCANCIA DE EMOJIS: ${useEmojis ? "Sim, use emojis." : "N\xE3o, mantenha formal."}
        
        SUA TAREFA: 
        Criar uma configura\xE7\xE3o completa de chatbot em JSON para este neg\xF3cio espec\xEDfico.
        
        REGRAS CR\xCDTICAS:
        1. **USE O CONTEXTO:** Extraia o nome real da empresa, telefones, endere\xE7os e listas de produtos do contexto fornecido.
        2. **SEJA ESPEC\xCDFICO:** N\xE3o crie regras gen\xE9ricas. Se o site lista "Pizza de Calabresa", crie uma regra para isso.
        3. **MENU PRINCIPAL:** Crie uma regra para "menu" ou "in\xEDcio" que liste as op\xE7\xF5es dispon\xEDveis de forma clara.
        4. **CONTATO:** Crie sempre uma regra para "contato" ou "falar com atendente".
        
        INTERFACE ESPERADA:
        interface LogicJson {
          default_reply: string;
          pause_bot_after_reply?: boolean;
          rules: {
            keywords: string[];
            reply: string;
            pause_bot_after_reply?: boolean;
            mediaUrl?: string;
            mediaType?: 'image' | 'video' | 'audio' | 'document';
          }[];
        }

        Responda APENAS com o JSON v\xE1lido.
      `;
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents: "Gere o JSON completo."
      });
      const jsonStr = (result.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const logicJson = JSON.parse(jsonStr);
      const newLogic = await storage.createLogic({
        name: logicName,
        description: `Generated by AI from: ${prompt.slice(0, 50)}...`,
        logicJson,
        logicType: "ai",
        isActive: true,
        userId
      });
      if (context) {
        const logicDir = path4.join(process.cwd(), "server", "data", "logics", newLogic.id);
        if (!fs4.existsSync(logicDir)) {
          fs4.mkdirSync(logicDir, { recursive: true });
        }
        fs4.writeFileSync(path4.join(logicDir, "site-context.txt"), context);
      }
      res.json(newLogic);
    } catch (error) {
      console.error("Generate and Save error:", error);
      res.status(500).json({ message: "Failed to generate and save logic" });
    }
  });
  app2.get("/api/broadcast-templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getBroadcastTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching broadcast templates:", error);
      res.status(500).json({ message: "Failed to fetch broadcast templates" });
    }
  });
  app2.post("/api/broadcast-templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertBroadcastTemplateSchema.parse({
        ...req.body,
        userId
      });
      const template = await storage.createBroadcastTemplate(data);
      res.json(template);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating broadcast template:", error);
      res.status(500).json({ message: "Failed to create broadcast template" });
    }
  });
  app2.delete("/api/broadcast-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteBroadcastTemplate(req.params.id);
      res.json({ message: "Template deleted" });
    } catch (error) {
      console.error("Error deleting broadcast template:", error);
      res.status(500).json({ message: "Failed to delete broadcast template" });
    }
  });
  app2.post("/api/ai/generate-broadcast", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(403).json({ message: "User not found" });
      const ai = getAI2(user.geminiApiKey);
      if (!ai) return res.status(503).json({ message: "Gemini AI not configured" });
      const { prompt, context } = req.body;
      if (!prompt) return res.status(400).json({ message: "Prompt is required" });
      const systemPrompt = `Voc\xEA \xE9 um assistente de marketing especializado em criar mensagens para disparos de WhatsApp.
      Crie uma mensagem curta, direta e persuasiva baseada no pedido do usu\xE1rio.
      Use emojis para tornar a mensagem amig\xE1vel.
      Se o usu\xE1rio fornecer um contexto (ex: lista de produtos), use-o.
      Responda APENAS com o texto da mensagem.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt
        },
        contents: `Contexto: ${context || "Nenhum"}

Pedido: ${prompt}`
      });
      const text2 = response.text || "";
      res.json({ message: text2.trim() });
    } catch (error) {
      console.error("Error generating broadcast message:", error);
      res.status(500).json({ message: "Failed to generate message" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || !adminUser.isAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const { id } = req.params;
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
      }
      const passwordHash = await bcrypt2.hash(password, 10);
      await storage.updateUser(id, { passwordHash });
      res.json({ message: "Senha atualizada com sucesso" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Erro ao resetar senha" });
    }
  });
  app2.patch("/api/admin/users/:userId/toggle-admin", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || !adminUser.isAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const { userId } = req.params;
      const { isAdmin } = req.body;
      await storage.updateUser(userId, { isAdmin });
      res.json({ message: "Permiss\xF5es atualizadas com sucesso" });
    } catch (error) {
      console.error("Error toggling admin status:", error);
      res.status(500).json({ message: "Erro ao atualizar permiss\xF5es" });
    }
  });
  app2.post("/api/setup-admin", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await storage.updateUser(userId, { isAdmin: true });
    res.json({ message: "Usu\xE1rio promovido a admin com sucesso! Recarregue a p\xE1gina." });
  });
  app2.get("/api/whatsapp/contacts/:deviceId/:contactId/pic", async (req, res) => {
    const { deviceId, contactId } = req.params;
    try {
      const client = getClient(deviceId);
      if (!client) {
        return res.status(404).json({ message: "Device not connected" });
      }
      let targetId = contactId;
      if (!targetId.includes("@")) {
        targetId = `${targetId}@c.us`;
      }
      const picUrl = await client.getProfilePicUrl(targetId);
      if (picUrl) {
        res.redirect(picUrl);
      } else {
        res.status(404).send("No profile pic");
      }
    } catch (error) {
      console.error("Error fetching profile pic:", error);
      res.status(500).send("Error fetching profile pic");
    }
  });
  app2.post("/api/conversations/:conversationId/messages/media", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const { conversationId } = req.params;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
      const client = getClient(conversation.deviceId);
      if (!client) return res.status(503).json({ message: "WhatsApp not connected" });
      const media = new MessageMedia(file.mimetype, file.buffer.toString("base64"), file.originalname);
      await client.sendMessage(conversation.contactPhone, media);
      await storage.createMessage({
        conversationId,
        direction: "outgoing",
        content: `[\xC1udio Enviado]`,
        isFromBot: false
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending media:", error);
      res.status(500).json({ message: "Failed to send media" });
    }
  });
  app2.patch("/api/devices/:deviceId/settings", isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { shouldTranscribe } = req.body;
      await storage.updateDevice(deviceId, { shouldTranscribe });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating device settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.post("/api/whatsapp/sync-contacts/:deviceId", isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const userId = req.session.userId;
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const success = await syncContacts(deviceId);
      if (success) {
        res.json({ message: "Contacts synced successfully" });
      } else {
        res.status(400).json({ message: "Failed to sync contacts. Device may not be connected." });
      }
    } catch (error) {
      console.error("[API] Error syncing contacts:", error);
      res.status(500).json({ message: error.message || "Failed to sync contacts" });
    }
  });
  app2.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { deviceId } = req.query;
      const allDevices = await storage.getDevices();
      const userDevices = allDevices.filter((d) => d.userId === userId);
      const targetDeviceIds = deviceId ? [deviceId] : userDevices.map((d) => d.id);
      const allConversations = await Promise.all(
        targetDeviceIds.map((id) => storage.getConversations(id))
      );
      const conversations2 = allConversations.flat();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1e3);
      const messageCounts = await Promise.all(
        conversations2.map(async (conv) => {
          const messages2 = await storage.getMessages(conv.id);
          return messages2.filter((m) => new Date(m.timestamp) > last24h).length;
        })
      );
      const activeChats = conversations2.filter((c) => c.isActive).length;
      const messagesToday = messageCounts.reduce((sum, count) => sum + count, 0);
      const responseRate = activeChats > 0 ? Math.round(messagesToday / activeChats * 100) : 0;
      res.json({
        activeChats,
        messagesToday,
        responseRate: Math.min(responseRate, 100)
        // Cap at 100%
      });
    } catch (error) {
      console.error("[API] Error fetching stats:", error);
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });
  app2.post("/api/devices/:id/start", isAuthenticated, async (req, res) => {
    try {
      const deviceId = req.params.id;
      const userId = req.session.userId;
      const result = await startDeviceSession(deviceId, userId);
      if (result.success) {
        res.json({
          message: result.message,
          status: result.status || getWhatsAppSessionStatus(deviceId),
          qrCode: getWhatsAppQRCode(deviceId)
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("[API] Error starting device session:", error);
      res.status(500).json({ message: error.message || "Failed to start session" });
    }
  });
  app2.post("/api/devices/:id/stop", isAuthenticated, async (req, res) => {
    try {
      const deviceId = req.params.id;
      const userId = req.session.userId;
      const result = await stopDeviceSession(deviceId, userId);
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("[API] Error stopping device session:", error);
      res.status(500).json({ message: error.message || "Failed to stop session" });
    }
  });
  app2.post("/api/devices/:id/clear-session", isAuthenticated, async (req, res) => {
    try {
      const deviceId = req.params.id;
      const userId = req.session.userId;
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== userId) {
        return res.status(403).json({ message: "N\xE3o autorizado" });
      }
      await stopDeviceSession(deviceId, userId);
      const sessionPath = path4.join(process.cwd(), ".wwebjs_auth", `session-${deviceId}`);
      if (fs4.existsSync(sessionPath)) {
        fs4.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`[API] Deleted session folder for device ${deviceId}`);
      }
      await storage.updateDevice(deviceId, { connectionStatus: "disconnected" });
      await startDeviceSession(deviceId, userId);
      res.json({ message: "Sess\xE3o limpa com sucesso. Escaneie o novo QR Code." });
    } catch (error) {
      console.error("[API] Error clearing device session:", error);
      res.status(500).json({ message: error.message || "Failed to clear session" });
    }
  });
  console.log("[Server] Starting broadcast scheduler...");
  startBroadcastScheduler();
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express2();
app.use(express2.json({
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\uFFFD";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  await setup(app, server);
  const args = process.argv.slice(2);
  const portArgIndex = args.indexOf("--port");
  const portArg = portArgIndex !== -1 ? args[portArgIndex + 1] : void 0;
  const port = parseInt(portArg || process.env.PORT || "3025", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
    Promise.resolve().then(() => (init_whatsappManager(), whatsappManager_exports)).then(({ restoreWhatsAppSessions: restoreWhatsAppSessions3 }) => {
      restoreWhatsAppSessions3().catch((err) => log(`Failed to restore sessions: ${err}`));
    });
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path5.resolve(import.meta.dirname, "public");
  if (!fs5.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
