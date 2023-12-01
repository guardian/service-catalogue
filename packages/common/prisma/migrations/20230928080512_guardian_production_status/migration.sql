DROP TABLE IF EXISTS guardian_production_status;

-- The Guardian has six recognised production statuses for repositories.
-- Here they are enumerated and prioritised
create table guardian_production_status
(
    status   text PRIMARY KEY,
    priority integer NOT NULL
);

insert into guardian_production_status (status, priority)
values ('production', 0),
       ('testing', 1),
       ('documentation', 2), --no code, but still needs to be up to date
       ('prototype', 3),
       ('hackday', 4),
       ('learning', 5)
on conflict (status) do nothing;
