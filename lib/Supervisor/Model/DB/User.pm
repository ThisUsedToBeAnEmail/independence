package Supervisor::Model::DB::User;

use YAOO;

auto_build;

has dbh => isa(object);

sub all {
	my ($self, %filter) = @_;

	my $rows = $self->dbh->selectall_arrayref(q|select * from users|, {Slice => {}});

	return $rows;
}

sub find {
	my ($self, %filter) = @_;

	my (@columns, $filter);

	for (keys %filter) {
		push @columns, $_;
		$filter .= ' and ' if ($filter);
		$filter .= $_ . '= ?';
	}

	return $self->dbh->selectrow_hashref(qq|
		select * from users where ${filter}
	|, {}, map { $filter{$_} } @columns); 
}

sub create {
	my ($self, $data) = @_;

	my $create = $self->dbh->do(q|insert into users (
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
		token
	) values (
		?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
	)|, {}, 
		$data->{first_name},
		$data->{last_name},
		$data->{username},
		$data->{email},
		$data->{mobile},
		$data->{landline},
		$data->{address_line_1},
		$data->{address_line_2},
		$data->{address_line_3},
		$data->{address_line_4},
		$data->{admin},
		$data->{active},
		$data->{token}
	);

	return $create;
}

sub update_by {
	my ($self, $field, $data) = @_;

	my $update = $self->dbh->do(qq|update users set 
		first_name = ?,
		last_name = ?,
		email = ?,
		mobile = ?,
		landline = ?,
		address_line_1 = ?,
		address_line_2 = ?,
		address_line_3 = ?,
		address_line_4 = ?,
		admin = ?,
		active = ?,
		token = ?
	 where ${field} = ? |,
		{}, 
		$data->{first_name},
		$data->{last_name},
		$data->{email},
		$data->{mobile},
		$data->{landline},
		$data->{address_line_1},
		$data->{address_line_2},
		$data->{address_line_3},
		$data->{address_line_4},
		$data->{admin},
		$data->{active},
		$data->{token},
		$data->{$field}
	);

	return $update;
}

sub delete_by {
	my ($self, $field, $data) = @_;

	my $delete = $self->dbh->do(
		qq|delete from users where ${field} = ?|,
		{},	
		$data->{$field}
	);

	return $delete;
}



1;

__END__
