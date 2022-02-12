package Supervisor::Controller::Map;
use Mojo::Base 'Mojolicious::Controller', -signatures;

# This action will render a template
sub welcome ($self) {
	$self->render(msg => 'Welcome to the Mojolicious real-time web framework!');
}

1;
