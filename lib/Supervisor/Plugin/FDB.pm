package Supervisor::Plugin::FDB;

use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Supervisor::FDB;

sub register ($self, $app, $conf) {
	$conf = $app->{config}
		if (!$conf->{custom_fdb_spec});	
	my $fdb = Supervisor::FDB->load("production", $conf->{custom_fdb_spec});
	$app->helper("fdb.spec" => sub ($c, @args) {
		return $fdb->spec;
	});
	$app->helper("fdb.jspec" => sub ($c, @args) {
		return $fdb->json_spec;
	});
	$app->helper('fdb.read' => sub ($c, @args) {
		$fdb->read(@args);
	});
	$app->helper('fdb.read_lines' => sub ($c, @args) {
		$fdb->read_lines(@args);
	});
	$app->helper('fdb.write' => sub ($c, @args) {
		$fdb->write(@args);
	});
	$app->helper('fdb.write_lines' => sub ($c, @args) {
		$fdb->write_lines(@args);
	});
	$app->helper('fdb.write_line' => sub ($c, @args) {
		$fdb->write_line(@args);
	});
}

1;
