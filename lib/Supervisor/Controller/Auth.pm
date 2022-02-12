package Supervisor::Controller::Auth;
use Mojo::Base 'Mojolicious::Controller', -signatures;
use Crypt::Argon2 qw/argon2id_verify/;

sub check ($self) {	
	$self->render(json => {
		authenticated => $self->session('user') ? \1 : \0
	});
}

sub login ($self) {
	my $params = $self->req->json;
	my $users = $self->fdb->read('users');
	my $user = $users->{$params->{username}};
	if ($user && argon2id_verify($user->{password}, $params->{password})) {
		$self->session(user => $user, expires => time + 18000);
	}

	use Data::Dumper;
	warn Dumper $self->session('user');

	$self->render(json => {
		authenticated => $self->session('user') ? \1 : \0
	});
}

sub logout ($self) {
	$self->session(expires => 1);
	$self->render(json => {
		authenticated => \0
	});
}

1;
