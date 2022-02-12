package Supervisor::Controller::Spa;
use Mojo::Base 'Mojolicious::Controller', -signatures;

# This action will render a template
sub index ($self) {
	$self->render(spa_config => $self->fdb->jspec);
}

1;
