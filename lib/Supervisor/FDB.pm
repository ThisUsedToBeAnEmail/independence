package Supervisor::FDB;

# TEMPORARY I SHOULD USE AN ACTUAL DB/Storage like pg or es

use Mojo::Base -base,, -signatures;
use JSON;
use Cwd qw/getcwd/;
use open ":std", ":encoding(UTF-8)";
use POSIX qw/strftime/;
use File::Copy qw/copy/;
use Mime::Base64 qw//;
use Digest::SHA1;
use Fcntl qw(:flock);

our ($DIR, $JSON, $PROD);
BEGIN {
        $DIR = getcwd;
        $DIR =~ s/\/supervisor.*/\/supervisor/g;
        $JSON = JSON->new;
        
	sub load_file {
                my $file = shift;
                open my $fh, '<:encoding(UTF-8)', $file or die "Cannot open spec file";
                my $content = do { local $/; <$fh> };
                close $fh;
                return $JSON->decode($content);
        }

        sub copy_file {
                my ($file, $newFile) = @_;
                copy($file, $newFile) or die "Cannot copy file for history";
        }

        sub write_file {
                my ($file, $content) = @_;
                open my $fh, '>:encoding(UTF-8)', $file or die "Cannot open spec file";
                flock($fh, LOCK_EX) or die "Cannot lock file - $!\n";
		print $fh $JSON->pretty(1)->encode($content);
		flock($fh, LOCK_UN) or die "Cannot unlock file - $  !\n";
                close $fh;
        }

        $PROD = load_file("$DIR/filedb/production/spec.json");
}

has 'spec';

has 'env';

sub load ($package, $env, $custom) {
	$env ||= 'production';

	my $spec = load_file("$DIR/filedb/${env}/spec.json");
	my $custom_spec = load_file("$DIR/filedb/${env}/${custom}.json");

	# TODO maybe improve the merge AKA blessed::merge
	return $package->new(
		env => $env,
		spec => { %{$spec}, %{$custom_spec} },
		json => $JSON
	);
}

sub read ($self, $file) {
	my $env = $self->env;
	my $data = load_file("$DIR/filedb/${env}/${file}.json");
	return $data;
}

sub write ($self, $file, $content) {
	my $env = $self->env;
	write_file("$DIR/filedb/${env}/${file}.json", $content);
	return $file;
}

sub read_lines ($self, $file) {
	my $env = $self->env;
	my $data = load_lines("$DIR/filedb/$env/$file");
	return $data;
}

sub write_lines ($self, $file, $content) {
	write_lines($file, $content);
	return $file;
}

sub write_line ($self, $file, $content) {
	write_line($file, $content);
	return $file;
}

sub upload_image ($self, $params) {
	my $env = $self->env;

	my $type = $params->{type};

	unless ($self->images->{$type}) {
		return {
			error => "Image is not valid: $type"
		};
	}

	my ($data, $base64) = split /,/, $params->{image}->{base64};
	my ($mime) = $data =~ m!data:image/(\w+);base64!;

	if ( $mime !~ m/(png|jpeg|jpg|giff)/ ) {
		return {
			error => "Unsupported file type: $type"
		};
	}

	my $hex = Digest::SHA1::sha1_hex($base64);
	my $decoded = MIME::Base64::decode_base64($base64);

	my $file = "$DIR/public/images/$hex.$mime";
	open(my $fh, '>', $file) or die $!; # 3 argument open
	binmode $fh;
	print $fh $decoded;
	close $fh;

	$self->images->{$type} = "$hex.$mime";

	my $spec_file = "$DIR/filedb/$env/spec.json";
	my $time = strftime "%Y_%m_%d_%H_%M_%S", localtime time;

	copy_file($spec_file, "$DIR/filedb/$env/$time-image-spec.json");
	write_file($spec_file, $self->spec);

	return {
		file => $self->images->{$type}
	};
}

sub json_spec {
	return $JSON->encode($_[0]->spec);
}

1;
