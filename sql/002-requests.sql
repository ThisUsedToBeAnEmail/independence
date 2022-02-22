CREATE TABLE requests (
	id integer primary key autoincrement,
	title text not null,
	description text not null,
	priority integer not null,
	created_by integer not null references users(id),
	assigned integer not null references users(id),
	estimate_date integer,
	complete integer,
	complete_date integer,
	notes text
);
