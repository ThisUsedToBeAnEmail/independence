package Supervisor::Model::DB::Request;

use YAOO;

auto_build;

has dbh => isa(object);

sub all {
	my ($self, %filter) = @_;

	my $rows = $self->dbh->selectall_arrayref(q|select * from requests|, {Slice => {}});

	return $rows;
}

sub create {
	my ($self, $data) = @_;

	my $create = $self->dbh->do(q|insert into requests (
		title,
		description,
		priority,
		created_by
	) values (
		?, ?, ?, ?
	)|, {}, 
		$data->{title},
		$data->{description},
		$data->{priority},
		$data->{created_by}
	);

	return $create;
}

sub update_by {
	my ($self, $field, $data) = @_;

	my $update = $self->dbh->do(qq|update requests set 
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
		qq|delete from requests where ${field} = ?|,
		{},	
		$data->{$field}
	);

	return $delete;
}



1;

__END__
