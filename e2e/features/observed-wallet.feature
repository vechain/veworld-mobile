@ObservedWallet
Feature: The user can create and observe an observed wallet

  Background:
    * The app is opened
    * Open with demo account
    * The user is in the wallet management screen

@AddObservedWallet
Scenario Outline: User adds a wallet to observe
  When the user clicks on the Add Wallet button
  And follows the procedure to add an observed wallet with the "<wallet_address>" address
  Then he should see the observed wallet in the wallet list

  Examples:
    | wallet_address |
    | 0x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051 |


@RemoveObservedWallet
Scenario: User removes an observed wallet
  Given the user has an observed wallet with address "<wallet_address>"
  When the user deletes the wallet
  Then he should see the wallet removed from the wallet list

  Examples:
  | wallet_address |
  | 0x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051 |
