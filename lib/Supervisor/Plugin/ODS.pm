package Supervisor::Plugin::ODS;

use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Supervisor::Model::ODS;

use Supervisor::FDB;

sub register ($self, $app, $conf) {
	$conf = $app->{config}
		if (!$conf->{custom_fdb_spec});	
	my $ods = Supervisor::Model::ODS->new(
		environment => "dev", 
		storage => $conf->{ods_storage},
		connect => $conf->{ods_connect},
		custom_spec => $conf->{ods_custom_spec}
	);
	$app->helper('model' => sub ($c, @args) {
		return $ods->model(@args);	
	});
	$app->helper('spec' => sub {
		return $ods->spec();
	});
}

1;
