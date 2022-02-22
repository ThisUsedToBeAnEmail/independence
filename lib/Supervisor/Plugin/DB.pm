package Supervisor::Plugin::DB;

use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Supervisor::Model::DB;

sub register ($self, $app, $conf) {
	$conf = $app->{config}
		if (!$conf->{db_name});	
	my $db = Supervisor::Model::DB->new()->connect($conf->{db_name});
	$app->helper('model' => sub ($c, @args) {
		$db->model(@args);
	});
}

1;
