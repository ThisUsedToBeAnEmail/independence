CREATE TABLE subjects (
	id integer primary key autoincrement,
	subject integer not null references users(id),
	arrival_date integer,
	leave_date integer,
	notes text,
	custom_column_1 text,
	custom_column_2 text,
	custom_column_3 text,
	custom_column_4 text,
	custom_column_5 text
);

CREATE TABLE subjects_users (
	id integer primary key autoincrement,
	subject integer not null references subjects(id),
	user integer not null references users(id)
);

CREATE TABLE subjects_chats (
	id integer primary key autoincrement,
	chat text,
	subject integer not null references subjects(id),
	author integer not null references users(id),
	time integer
);
