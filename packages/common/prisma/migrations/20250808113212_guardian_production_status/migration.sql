
insert into guardian_production_status (status, priority)
values ('interactive', 6)
on conflict (status) do nothing;
