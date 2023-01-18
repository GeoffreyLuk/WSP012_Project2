insert into users(
        first_name,
        last_name,
        email,
        phone_number,
        password,
        access_level,
        last_online,
        created_at,
        updated_at
    )
values (
        'Gary',
        'KONG',
        'garygarylmao@gmail.com',
        97056799,
        'admin',
        'admin',
        now(),
        now(),
        now()
    );
insert into locations(
        venue,
        address,
        capacity,
        created_at,
        updated_at
    )
values (
        'Asia World Expo',
        'Airport Expo Blvd, Chek Lap Kok',
        16000,
        now(),
        now()
    );
insert into activity_tracking(
        user_id,
        behavior,
        created_at,
        updated_at
    )
values(1, '/404.html', now(), now());
insert into organiser_list(
        user_id,
        organiser_name,
        date_joined,
        organisation_details,
        created_at,
        updated_at
    )
values(1, 'BLACKPINK', now(), 'BORN PINK', now(), now());
INSERT into shows(
        organiser_id,
        show_name,
        details,
        show_language,
        show_duration,
        sales_start_date,
        sales_end_date,
        categories,
        published,
        launch_date,
        end_date,
        created_at,
        updated_at
    )
values(
        1,
        'BORN PINK WORLD TOUR MACAU',
        '[{ "TITLE": "BLACKPINK IN YOUR AREA" }]',
        'ENGLISH',
        120,
        now(),
        now(),
        'CONCERT',
        false,
        now(),
        now(),
        now(),
        now()
    );
INSERT into tickets(
        show_id,
        type,
        pricing,
        max_quantity,
        early_discount,
        show_date,
        created_at,
        updated_at
    )
values(
        2,
        'VIP',
        2799,
        1000,
        300,
        now(),
        now(),
        now()
    );
INSERT into chatrooms (
        chatroom_name,
        user_id,
        show_id,
        created_at,
        updated_at
    )
values ('BORN PINK', 1, 2, now(), now());
INSERT into shows_locations(
        show_id,
        location_id,
        created_at,
        updated_at
    )
values (2, 1, now(), now());