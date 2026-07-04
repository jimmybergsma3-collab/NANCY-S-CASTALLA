alter table orders add column if not exists admin_email_sent_at timestamptz;
alter table orders add column if not exists customer_email_sent_at timestamptz;
alter table orders add column if not exists status_email_sent_at timestamptz;
