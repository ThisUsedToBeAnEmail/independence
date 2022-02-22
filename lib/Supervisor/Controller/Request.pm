package Supervisor::Controller::Request;
use Mojo::Base 'Mojolicious::Controller', -signatures;

sub base ($self) {
	return 1;
}

# This action will render a template
sub all ($self) {
	my $requests = $self->model('Request')->all();

	$self->render(json => {
		data =>	$requests,
		total => scalar @{$requests}
	});
}

sub create ($self) {
	my $data = $self->req->json;

	$data->{created_by} = 1;

	my $success = $self->model('Request')->create($data);
	
	my $requests = $self->model('Request')->all();

	$self->render(json => {
		success => $success,
		all => $requests,
	});
}



1;
