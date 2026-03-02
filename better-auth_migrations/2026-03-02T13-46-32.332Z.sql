create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "email_verified" boolean not null, "image" text, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz default CURRENT_TIMESTAMP not null, "two_factor_enabled" boolean, "first_name" text not null, "last_name" text not null);

create table "session" ("id" text not null primary key, "expires_at" timestamptz not null, "token" text not null unique, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz not null, "ip_address" text, "user_agent" text, "user_id" text not null references "user" ("id") on delete cascade);

create table "account" ("id" text not null primary key, "account_id" text not null, "provider_id" text not null, "user_id" text not null references "user" ("id") on delete cascade, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" timestamptz, "refresh_token_expires_at" timestamptz, "scope" text, "password" text, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz not null);

create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expires_at" timestamptz not null, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz default CURRENT_TIMESTAMP not null);

create table "two_factor" ("id" text not null primary key, "secret" text not null, "backup_codes" text not null, "user_id" text not null references "user" ("id") on delete cascade);

create table "rate_limit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "last_request" bigint not null);

create index "session_user_id_idx" on "session" ("user_id");

create index "account_user_id_idx" on "account" ("user_id");

create index "verification_identifier_idx" on "verification" ("identifier");

create index "two_factor_secret_idx" on "two_factor" ("secret");

create index "two_factor_user_id_idx" on "two_factor" ("user_id");
