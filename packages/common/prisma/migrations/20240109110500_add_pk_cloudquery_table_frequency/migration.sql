-- Add a primary key to cloudquery_table_frequency to prevent duplicated records
ALTER TABLE cloudquery_table_frequency
ADD CONSTRAINT cloudquery_table_frequency_pk PRIMARY KEY (table_name);