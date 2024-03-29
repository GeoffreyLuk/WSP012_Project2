create table users(
    id serial primary key,
    first_name text not null,
    last_name text not null,
    email text not null,
    phone_number integer,
    icon text default 'default_icon.png',
    password text not null,
    access_level integer not null default 2,
    last_online timestamp not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table locations(
    id serial primary key,
    venue text not null,
    address text not null,
    capacity integer,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table categories(
    id serial primary key,
    category text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table direct_messages(
    id serial primary key,
    from_user integer,
    foreign key (from_user) references users(id),
    to_user integer,
    foreign key (to_user) references users(id),
    content_type integer not null,
    content text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table organiser_list (
    id serial primary key,
    user_id integer not null,
    foreign key (user_id) references users(id),
    organiser_name text not null,
    date_joined timestamp not null,
    organisation_pic text,
    organisation_details text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table shows(
    id serial primary key,
    organiser_id integer not null,
    foreign key (organiser_id) references organiser_list(id),
    category_id integer not null,
    foreign key (category_id) references categories(id),
    show_name text not null,
    details JSONB not null,
    ticket_discount jsonb,
    show_duration integer not null,
    sales_start_date timestamp not null,
    sales_end_date timestamp not null,
    published boolean not null,
    launch_date timestamp not null,
    end_date timestamp not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table tickets (
    id serial primary key,
    show_id integer not null,
    foreign key(show_id) references shows(id),
    type text not null,
    pricing integer not null,
    max_quantity integer not null,
    show_date timestamp not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table chatrooms (
    id serial primary key,
    chatroom_name text not null,
    show_id integer not null,
    foreign key (show_id) references shows(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table shows_locations (
    id serial primary key,
    show_id integer not null,
    foreign key(show_id) references shows(id),
    location_id integer not null default 36,
    foreign key(location_id) references locations(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table chatroom_participants (
    id serial primary key,
    chatroom_id integer not null,
    foreign key (chatroom_id) references chatrooms(id),
    user_id integer not null,
    foreign key (user_id) references users(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table chatroom_messages (
    id serial primary key,
    chatroom_id integer not null,
    foreign key (chatroom_id) references chatrooms(id),
    user_id integer not null,
    foreign key(user_id) references users(id),
    content_type integer not null,
    content text not null,
    message_time timestamp,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table images (
    id serial primary key,
    show_id integer,
    foreign key(show_id) references shows(id),
    organiser_id integer,
    foreign key (organiser_id) references organiser_list(id),
    path text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table users_purchases(
    id serial primary key,
    user_id integer not null,
    foreign key(user_id) references users(id),
    purchase_date timestamp,
    ticket_id integer not null,
    foreign key(ticket_id) references tickets(id),
    quantity integer not null,
    ticket_paid boolean not null,
    user_discount jsonb,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
create table favourites(
    id serial primary key,
    show_id integer not null,
    foreign key(show_id) references shows(id),
    user_id integer not null,
    foreign key(user_id) references users(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
-- Delete Table
-- DROP TABLE favourites;
-- DROP TABLE users_purchases;
-- DROP TABLE images;
-- DROP TABLE chatroom_messages;
-- DROP TABLE chatroom_participants;
-- DROP TABLE shows_locations;
-- DROP TABLE chatrooms;
-- DROP TABLE tickets;
-- DROP TABLE shows;
-- DROP TABLE organiser_list;
-- DROP TABLE locations;
-- DROP TABLE users;