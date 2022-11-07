# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2017-10-31
### Added
- Encryption system is now working. It uses [Forge](https://github.com/digitalbazaar/forge) with AES cipher.
### Changed
- Chat lifetime system has been remodeled. Now a chat will not be deleted until a user defined time or until it's flagged as inactive (24 hours of no messages, as for now).
- User inactiviy check system has been remodeled. Now a user wil be flagged as inactive after 1 minute of no messages (also thinking about user interaction with the website) and then will be deleted after 5 minutes of inactivity.
- Changed internal chat events handlers to socket events layers (no more on the deep server side layer).
### Fixed
- Fixed wrong colours for names in chat

## [0.1.0] - 2017-08-26
### Added
- Basic chat system (no encryption yet).
- Server side chat lifetime checks.
- Server side users inactivity checks.

## [0.0.0] - 2017-08-12
- project started.
