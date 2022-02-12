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

	my $users = $auth->under("/users")->to("user#base");
	$users->get("/")->to("user#all");
	$users->post("/")->to("user#update");
	$users->delete("/")->to("user#delete");
	$users->post("/create")->to("user#create");


	$auth->post("/auth/login")->to("auth#login");
}

1;
