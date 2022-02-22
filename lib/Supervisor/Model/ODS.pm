package Supervisor::Model::ODS;

use YAOO;

auto_build;

use Carp qw/croak/;

has [qw/environment storage custom_spec/] => isa(string);

has [qw/connect available_models loaded_models/] => isa(hash({}));

use File::Find;
use Module::Load qw/load/;

sub build {
	my ($self, %options) = @_;
	(my $directory = __FILE__) =~ s/.pm$//;
	find({ wanted => sub {
		if (-f $_ && $_ =~ m/\.pm$/) {
			(my $file = $_) =~ s/.*(?:lib\/)(.*)/$1/;
			require $file;
			my $module = join('::', split('/', $file));
			$module =~ s/\.pm$//;
			(my $stub = $module) =~ s/.*(?:Table\:\:)(.*)/$1/;
			$self->available_models->{$stub} = $module;
		}
	}, no_chdir => 1 }, $directory);

	return $self;
}

sub model {
	my ($self, $model, $type, $custom_file_name) = @_;
		
	my $module = $self->available_models->{$model} 
		or croak "No '${model}' model available to load.";

	use Data::Dumper;
	warn Dumper $module;

	#my $test = Table::Spec->connect('Directory', {
	#	directory => 't/filedb/directory/truth/test2',
	#	cache_directory => 't/filedb/directory/cache/test2',
	#	serialize_class => 'YAML'
	#});


}

sub spec {
	my ($self) = @_;

	my $spec_model = $self->model('Spec', 'YAML');
	warn Dumper $self->custom_spec('Spec::Custom', 'YAML', $self->custom_spec);

}


1;
