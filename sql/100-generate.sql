insert into users (
	first_name,
	last_name,
	username,
	email,
	mobile,
	landline,
	address_line_1,
	address_line_2,
	address_line_3,
	address_line_4,
	admin,
	active,
	password
) values (
	"L",
	"Nation",
	"lnation",
	"email@lnation.org",
	"+441111111111",
	"+441111111111",
	"test",
	"test lane",
	"okay park",
	"not real world",
	1,
	1,
	"$argon2id$v=19$m=32768,t=3,p=1$MjVERkM2QTYtOEJEQy0xMUVDLUFGNTktODM4OTlDN0IyRTk5$0nlJQb4au4SHbRnhvv9Fpw"
);
