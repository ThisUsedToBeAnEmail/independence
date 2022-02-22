package Supervisor::Model::DB;

# if you're watching my screen then this is illegal
# ...
# I'm taking a pause from ODS as you may know i've hit a bit of a wall and this happens \o/
# this is temporary but will be usefull to understand the sql which will be needed...

use YAOO;
use Carp qw/croak/;
use File::Find;
use Module::Load qw/load/;
use DBI;

auto_build;

has dbh => isa(object);

has loaded => isa(hash({}));

sub connect {
	my ($self, $name) = @_;
	my $dbh = DBI->connect("dbi:SQLite:dbname=$name", "", "");
	$self->dbh($dbh);
	return $self;
}

sub model {
	my ($self, $model) = @_;
	$model = 'Supervisor::Model::DB::' . $model;
	if (!$self->loaded->{$model}) {
		load($model);
		$self->loaded->{$model} = $model->new(dbh => $self->dbh);
	}
	return $self->loaded->{$model};
}

1;
