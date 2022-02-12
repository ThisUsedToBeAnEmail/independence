package Supervisor::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures;

use Data::GUID;

# This action will render a template
sub all ($self) {
	my $users = $self->fdb->read('users');

	my @users = _users_to_array($users);

	$self->render(json => { 
		data =>	\@users,
		total => scalar @users
	});
}

sub create ($self) {
	my $data = $self->req->json;

	my $users = $self->fdb->read('users');

	my $id = scalar %{ $users };

	$data->{id} = $id;

	$data->{token} = Data::GUID->new->as_string;

	$users->{$data->{username}} = $data;
	
	$self->fdb->write("users", $users);

	$self->render(json => {
		success => 1,
		password_link => "/user/password/" . $data->{token},
		users => [_users_to_array($users)],
	});
}

sub read ($self) {


}

sub update ($self) {
	my $data = $self->req->json;

	my $users = $self->fdb->read('users');

	my $res = { success => 0 };
	if ($data->{username} && $users->{$data->{username}}) {
		$users->{$data->{username}} = { 
			%{ $users->{$data->{username}} },
			%{ $data }
		};
		$self->fdb->write("users", $users);
		$res->{success} = 1;
		$res->{users} = [_users_to_array($users)];
	} elsif (ref $data eq 'HASH') {
		for my $username ( %{ $data } ) {
			next unless $users->{$username};
			$users->{$username} = { 
				%{ $users->{$username} },
				%{ $data->{$username} }
			};
		}
		$self->fdb->write("users", $users);
		$res->{success} = 1;
		$res->{users} = [_users_to_array($users)];
	}

	$self->render(json => $res);
}

sub delete ($self) {
	my $data = $self->req->json;

	my $users = $self->fdb->read('users');

	my $res = { success => 0 };

	if ($data->{username} && $users->{$data->{username}} ) {
		delete $users->{$data->{username}};
		$self->fdb->write("users", $users);
		$res->{success} = 1;
		$res->{users} = [_users_to_array($users)];
	} elsif (ref $data eq 'HASH') {
		for my $username ( %{ $data } ) {
			delete $users->{$username};
		}
		$self->fdb->write("users", $users);
		$res->{success} = 1;
		$res->{users} = [_users_to_array($users)];
	}

	$self->render(json => $res);
}

sub _users_to_array {
	my ($users) = @_;
	return map {
		delete $users->{$_}->{password};
		delete $users->{$_}->{token};
		$users->{$_};
	} keys %{ $users };
}

1;
