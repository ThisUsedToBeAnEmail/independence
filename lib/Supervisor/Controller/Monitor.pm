package Supervisor::Controller::Monitor;
use Mojo::Base 'Mojolicious::Controller', -signatures;

# This action will render a template
sub index ($self) {
	#$self->render(msg => 'Welcome to the Mojolicious real-time web framework!');
}

sub websocket ($self) {
	$self->app->log->debug("WebSocket opened");

	$self->inactivity_timeout(300);

	$self->on(message => sub ($c, $msg) {
		$c->send("echo: $msg added");
	});

	$self->on(finish => sub ($c, $code, $reason = undef) {
		$self->app->log->debug("WebSocket closed with status $code");
	});
}

1;
