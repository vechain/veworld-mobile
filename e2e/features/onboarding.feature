@onboarding
Feature: User Onboarding

  Background:
    * The app is opened
    * The user is in the onboarding welcome screen

  Scenario Outline: User successfully creates a local wallet with pin protection
    When The user onboards with a new local wallet
    And The user chooses to protect the wallet with a pin "<pin>" and confirms with "<pin>"
    And The user completes the wallet creation
    Then The user should see wallet home screen

    Examples:
      | pin    |
      | 134679 |

  @notAndroid
  Scenario: User successfully creates a local wallet with biometrics protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with a new local wallet
    And The user chooses to protect the wallet with biometrics
    And The user completes the wallet creation
    Then The user should see wallet home screen

  Scenario Outline: User successfully imports a local wallet
    When The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    And The user chooses to protect the wallet with a pin "<pin>" and confirms with "<pin>"
    And The user completes the wallet creation
    Then The user should see wallet home screen

    Examples:
      | pin    | mnemonicOrPk                                                                                                                                     |
      | 134679 | denial kitchen pet squirrel other broom bar gas better priority spoil cross                                                                      |
      | 134679 | record minute play dream viable zero brisk true pink retreat juice fresh resist tent coast table damp pupil water mutual shoe year capable fluid |
      | 134679 | 99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36                                                                                 |
      | 134679 | 0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36                                                                               |
      | 134679 | 0x99F0500549792796C14fED62011A51081DC5B5E68FE8BD8A13B86BE829c4FD36                                                                               |

  Scenario Outline: User successfully imports a keystore file
    When The user onboards with an imported keystore file "<keystoreFile>" with password "<password>"
    And The user chooses to protect the wallet with a pin "<pin>" and confirms with "<pin>"
    And The user completes the wallet creation
    Then The user should see wallet home screen

    Examples:
      | pin    | password   | keystoreFile                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
      | 134679 | Password1! | {\\"version\\":3,\\"id\\":\\"8E39FB2F-3AE5-4DFC-849B-C78B310E6622\\",\\"crypto\\":{\\"ciphertext\\":\\"ebcc42b079516d1ba5a0377743422a17d8795a1c24d3ad7b7d30dbd6c8edab12\\",\\"cipherparams\\":{\\"iv\\":\\"3c3917afdf69bdc47f9693121fcc53e0\\"},\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"r\\":8,\\"p\\":1,\\"n\\":262144,\\"dklen\\":32,\\"salt\\":\\"ac93e95a3a6d1b070c720078625a4ccc2cef113508e2dcc9acd774325dfbe326\\"},\\"mac\\":\\"ff87134edec116091a51572a2ea745b96a169c2bae1fa09007070f3dcf4a53ec\\",\\"cipher\\":\\"aes-128-ctr\\"},\\"address\\":\\"f077b491b355e64048ce21e3a6fc4751eeea77fa\\"} |

  @noReset
  Scenario Outline: User attempts to import a local wallet with an invalid mnemonic or private key
    When The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    Then The user should not see wallet protection screen

    Examples:
      | mnemonicOrPk                                                                        |
      | denial denial denial denial denial denial denial denial denial denial denial denial |
      | 011a51081dc5b5e68fe8bd8a13b86be829c4fd36                                            |

  Scenario Outline: User attempts to import a local wallet with an invalid pin
    When The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    And The user chooses to protect the wallet with a pin "<pin>" and confirms with "<confirmPassword>"
    Then The user should not see wallet success screen

    Examples:
      | pin    | confirmPassword | mnemonicOrPk                                                                |
      | 134679 | 111111          | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  @notAndroid
  Scenario Outline: User successfully imports a local wallet and chooses biometric protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    And The user chooses to protect the wallet with biometrics
    And The user completes the wallet creation
    Then The user should see wallet home screen

    Examples:
      | mnemonicOrPk                                                                                                                                     |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross                                                                      |
      | record minute play dream viable zero brisk true pink retreat juice fresh resist tent coast table damp pupil water mutual shoe year capable fluid |
      | 99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36                                                                                 |

  @notAndroid
  Scenario Outline: The user attempts to use biometrics when it is not authorized
    Given The app is opened and is iOS and does not have biometrics authorization
    And The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    And The user chooses to protect the wallet with biometrics
    Then The button use biometrics is disabled

    Examples:
      | mnemonicOrPk                                                                |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  @notAndroid @failsInParallel
  Scenario Outline: The user attempts to use biometrics when device is not enrolled
    Given The user onboards with an imported mnemonic or private key "<mnemonicOrPk>"
    And The user chooses to protect the wallet with biometrics and does not enroll
    Then The button use biometrics is disabled

    Examples:
      | mnemonicOrPk                                                                |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross |
