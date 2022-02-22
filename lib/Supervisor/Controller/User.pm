package Supervisor::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures;

use Data::GUID;

sub base ($self) {
	return 1;
}

# This action will render a template
sub all ($self) {
	my $users = $self->model('User')->all();

#	my @users = _users_to_array($self->stash("users"));

	$self->render(json => { 
		data =>	$users,
		total => scalar @{$users}
	});
}

sub create ($self) {
	my $data = $self->req->json;

	$data->{token} = Data::GUID->new->as_string;

	my $success = $self->model('User')->create($data);
	
	my $users = $self->model('User')->all();

	$self->render(json => {
		success => $success,
		password_link => "/user/password/" . $data->{token},
		users => $users,
	});
}

sub read ($self) {


}

sub update ($self) {
	my $data = $self->req->json;

	my $model = $self->model('User');

	my $update = $model->update_by('username', $data);

	my $res = {
		success => $update,
		users => $model->all()
	};

	$self->render(json => $res);
}

sub delete ($self) {
	my $data = $self->req->json;

	my $model = $self->model('User');

	my $delete = $model->delete_by('username', $data);

	my $res = {
		success => $delete,
		users => $model->all()
	};

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
