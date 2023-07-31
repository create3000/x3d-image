#!/usr/bin/perl
use strict;
use warnings;
use v5.10.0;
use utf8;
use open qw/:std :utf8/;

if (`git branch --show-current` ne "development\n")
{
	say "Wrong branch, must be development, cannot release version!";
	exit 1;
}

system "git", "checkout", "main";
system "git", "merge", "development";

my $version = `npm pkg get version | sed 's/"//g'`;
chomp $version;
say "package.json version $version";

my $online = `npm view x3d-tidy version`;
chomp $online;
say "NPM version $online";

system "npm version patch --no-git-tag-version --force" if $version eq $online;
system "npm i x_ite\@latest";

system "git", "add", "-A";
system "git", "commit", "-am", "Published version $version";
system "git", "push", "origin";

system "npm", "publish";

system "git", "checkout", "development";
system "git", "merge", "main";
system "git", "push", "origin";
