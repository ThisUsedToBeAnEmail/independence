package Supervisor;
use Mojo::Base 'Mojolicious', -signatures;

use Mojolicious::Sessions;

# This method will run once at server start
sub startup ($self) {

	# Load configuration from config file
	my $config = $self->plugin('NotYAMLConfig');

	# Configure the application
	$self->secrets($config->{secrets});

	$self->plugin("Supervisor::Plugin::FDB");

	# Router
	my $r = $self->routes;

	$r->any('/')->to('spa#index')->name('index');
	$r->any("/auth/check")->to("auth#check");

	my $auth = $r->under("/" => sub ($c) {
		return 1 if $c->session('user');
		
		use Data::Dumper;
		return 1 if $c->match->endpoint->name =~ m/^auth/;

		return undef;
	});

	$auth->any("/auth/logout")->to("auth#logout");	

	$auth->get("/users")->to("user#all");

	$auth->post("/users")->to("user#update");
	$auth->post("/user")->to("user#create");
	$auth->post("/auth/login")->to("auth#login");

	$auth->delete("/users")->to("user#delete");

}

1;
