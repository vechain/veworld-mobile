# Setup Ledger emulator

The core idea is to have an emulated Ledger device that can be used to implement some automatic tests before a developer push some changes to GitHub and to avoid that once the new code goes to production the Ledger connection result broken and the users cannot connect it to the VeWorld app or extension.

Ledger has a simple emulator called [Speculos](https://github.com/LedgerHQ/speculos) but only emulate manually via API the transactions with a Ledger App.

## Requirements

- Docker
- Python > 3.10
- Vechain Ledger app (<https://github.com/LedgerHQ/app-vechain> or <https://github.com/vechain/app-vechain>)
- Speculos Ledger emulator (<https://github.com/LedgerHQ/speculos>)
- Google Bumble (<https://google.github.io/bumble/>)

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

After the patch and once you have created the Docker Image navigate to the folder `ledgers` to run the emulators in a Docker container

```bash
cd ./ledgers
docker-compose up -d
```

## Blocking problems

The problem at the moment is that someone can't connect a virtual Ledger via Bluetooth or USB to the mobile app (Only Android emulator since IOS emulator does not support Bluetooth).
To solve the Bluetooth problem I found a library that emulate Bluetooth devices and can communicate with the Android Emulator via GRPC[^1], now that the bluetooth emulation is done the tough part start.

Before we can exchange transaction between the Ledger Speculos and the VeWorld app the Ledger device need to be discoverable from it and the app should be able to connect to it like an hardware one.

### Problems

- [ ] Make the emulated device be discovered by VeWorld app

- [ ] Emulate the connection and the device: the virtual device need to be discoverable like a real Ledger

- [ ]  Integrate the VeWorld app request to the emulated Ledger to simulate a real one. Like: transaction, wallet add/import, contacts sync ecc. ecc.

[^1]: You can find the demo code to the barebone emulated bluetooth device [here](https://example.com)
