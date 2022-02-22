CREATE TABLE users (
	id integer primary key autoincrement,
	first_name text not null,
	last_name text not null,
	username text not null unique,
	email text not null,
	mobile text,
	landline text,
	address_line_1 text,
	address_line_2 text,
	address_line_3 text,
	address_line_4 text,
	admin integer,
	active integer,
	token text,
	password text,
	last_active integer,
	last_action integer
);
