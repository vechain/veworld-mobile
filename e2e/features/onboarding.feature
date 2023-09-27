Feature: User Onboarding

  Background:
    * The app is opened
    * The user is in the onboarding welcome screen

  Scenario: User successfully creates a local wallet with password protection
    When The user onboards with a new local wallet
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<password>"
    Then The user should see wallet success screen

    Examples:
      | password |
      | 134679   |

  Scenario: User successfully creates a local wallet with biometrics protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with a new local wallet
    And The user chooses to protect the wallet with biometrics
    Then The user should see wallet success screen

    Examples:
      | password |
      | 134679   |

  Scenario:  User successfully imports a local wallet
    When The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<password>"
    Then The user should see wallet success screen

    Examples:
      | password | mnemonic                                                                    |
      | 134679   | denial kitchen pet squirrel other broom bar gas better priority spoil cross |


  Scenario: User attemps to import a local wallet with an invalid mnemonic
    When The user onboards with an imported mnemonic "<mnemonic>"
    Then The user should not see wallet protection screen

    Examples:
      | mnemonic                                                                            |
      | denial denial denial denial denial denial denial denial denial denial denial denial |

  Scenario: User attemps to import a local wallet with an invalid password
    When The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<confirmPassword>"
    Then The user should not see wallet success screen

    Examples:
      | password | confirmPassword | mnemonic                                                                    |
      | 134679   | 111111          | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario:  User successfully imports a local wallet and chooses biometric protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics
    Then The user should see wallet success screen

    Examples:
      | password | mnemonic                                                                    |
      | 134679   | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario: The user attempts to use biometrics when it is not authorized
    Given The app is opened and is iOS and does not have biometrics authorization
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics
    Then The button use biometrics is disabled

    Examples:
      | mnemonic                                                                    |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario: The user attempts to use biometrics when device is not enrolled
    Given The app is opened and is iOS
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics and does not enroll
    Then The button use biometrics is disabled

    Examples:
      | mnemonic                                                                    |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross |