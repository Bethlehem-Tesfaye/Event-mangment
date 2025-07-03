create table users (
  id serial primary key,
  name varchar,
  email varchar unique not null,
  password text not null,
  role varchar,  
  created_at timestamp default current_timestamp
);

create table profiles (
  id serial primary key,
  user_id integer unique not null references users(id) on delete cascade,
  bio text,
  phone varchar,
  birthday date
);

create table events (
  id serial primary key,
  title varchar,
  description text,
  location varchar,
  date date,
  time time,
  user_id integer not null references users(id) on delete cascade,
  created_at timestamp default current_timestamp
);

create table categories (
  id serial primary key,
  name varchar unique not null
);

create table event_categories (
  event_id integer not null references events(id) on delete cascade,
  category_id integer not null references categories(id) on delete cascade,
  primary key (event_id, category_id)
);

create table speakers (
  id serial primary key,
  name varchar,
  bio text
);

create table event_speakers (
  event_id integer not null references events(id) on delete cascade,
  speaker_id integer not null references speakers(id) on delete cascade,
  primary key (event_id, speaker_id)
);

create table tickets (
  id serial primary key,
  event_id integer not null references events(id) on delete cascade,
  name varchar,
  price numeric,
  quantity integer
);

create table registrations (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  ticket_id integer not null references tickets(id) on delete cascade,
  quantity integer not null default 1,
  registered_at timestamp default current_timestamp
);