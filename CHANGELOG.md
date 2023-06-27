# VeWorld Mobile Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--

Use the following template to create a new Unreleased change log.
## [Unreleased]
### Added

### Changed

### Fixed

### Removed
-->

## [Unreleased]
### Added
- [#658](https://github.com/vechainfoundation/veworld-mobile/pull/658) Ledger integration in the send flow, minors around import ledger logic and UI elements
- [#669](https://github.com/vechainfoundation/veworld-mobile/pull/669) Add changelog to repository
- [#598](https://github.com/vechainfoundation/veworld-mobile/pull/598) Integrated wallet connect 
- [#664](https://github.com/vechainfoundation/veworld-mobile/pull/664) Added account handling for wallet connect connections
- [#620](https://github.com/vechainfoundation/veworld-mobile/pull/620) Add loading state for send flow
- [#579](https://github.com/vechainfoundation/veworld-mobile/issues/579) Use atomic commit to update all devices at once for security operation

### Changed

### Fixed
- [#663](https://github.com/vechainfoundation/veworld-mobile/issues/663) Switch to requested network during wallet connect session requests
- [#666](https://github.com/vechainfoundation/veworld-mobile/issues/666) Wallet Connect: handle gas consumption when executing transactions
- [#678](https://github.com/vechainfoundation/veworld-mobile/issues/678) Wallet Connect: use common useSignTransaction and useDelegate hooks
- [#667](https://github.com/vechainfoundation/veworld-mobile/issues/667) Wallet Connect: updated UI in connected apps, sign transactions and sign message screens

### Removed

## [v0.100.0]