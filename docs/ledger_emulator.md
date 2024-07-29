# Setup Ledger emulator

## Requirements

- Docker
- Python > 3.10
- Vechain ledger app build (<https://github.com/LedgerHQ/app-vechain> or <https://github.com/vechain/app-vechain>)
- Speculos Ledger emulator (<https://github.com/LedgerHQ/speculos>)

## Install

`yarn add @zondax/zemu`

## Manual Test

To emulate a Ledger device within the mobile device emulator to test the funcionalities we need to download and run the Speculos ledger emulator docker container.

Follow these steps [Build Speculos on Docker](https://speculos.ledger.com/user/macm1.html#how-to-build-the-docker-image)

### Workaround error in build on MAC M1/2/3

Open the Speculos project folder in a terminal an follow these steps:

1. Generate a new Docker file with the new Speculos builder

    ```bash
    docker build -f build.Dockerfile -t speculos-builder:latest .
    ```

2. Patch the Dockerfile

    ```bash
    -FROM ghcr.io/ledgerhq/speculos-builder:latest AS builder
    +FROM speculos-builder:latest AS builder
    ```

3. Run again the build

    ```bash
    docker build -f Dockerfile -t speculos:latest .
    ```

After the patch and onece you created the Docker Image navigate to the folder `ledgers` to run the emulators in a Docker container

```bash
cd ./ledgers
docker-compose up -d
```

## Unit Tests
