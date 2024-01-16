Feature: User Onboarding

  Scenario: User can onboard
    Given The app is opened
    And The user follows the onboarding process
    Then The user should be onboarded

  Scenario: User can skip to password creation
    Given The app is opened
    And The user skips to password creation
    Then The user should see password creation


  Scenario: User can go through all onboarding screens for creating a new local wallet
    Given The app is opened
    And The user follows the onboarding and create wallet processes
    Then The user can create wallet

  Scenario: User successfully creates a local wallet with password protection
    Given The app is opened
    And The user onboards with a new local wallet
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<password>"
    Then The user should see wallet success screen 

    Examples:
      | password     | 
      | 134679       | 


  Scenario: User successfully creates a local wallet with biometrics protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with a new local wallet
    And The user chooses to protect the wallet with biometrics
    Then The user should see wallet success screen

    Examples:
      | password     | 
      | 134679       | 


  Scenario:  User successfully imports a local wallet
    Given The app is opened
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<password>"
    Then The user should see wallet success screen

    Examples:
      | password     | mnemonic                                                                    |
      | 134679       | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  
  Scenario: User attemps to import a local wallet with an invalid mnemonic
    Given The app is opened
    And The user onboards with an imported mnemonic "<mnemonic>"
    Then The user should not see wallet protection screen

    Examples:
      | mnemonic                                                                            |
      | denial denial denial denial denial denial denial denial denial denial denial denial |

  Scenario: User attemps to import a local wallet with an invalid password
    Given The app is opened
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password "<password>" and confirms with "<confirmPassword>"
    Then The user should not see wallet success screen

    Examples:
      | password     | confirmPassword     | mnemonic                                                                    |
      | 134679       | 111111              | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario:  User successfully imports a local wallet and chooses biometric protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics
    Then The user should see wallet success screen

    Examples:
      | password     | mnemonic                                                                    |
      | 134679       | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario: The user attempts to use biometrics when it is not authorized
    Given The app is opened and is iOS and does not have biometrics authorization
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics
    Then The user should see biometrics disabled alert

    Examples:
      | mnemonic                                                                            |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross         |

  Scenario: The user attempts to use biometrics when device is not enrolled
    Given The app is opened and is iOS
    And The user onboards with an imported mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics and does not enroll
    Then The user should see biometrics not enrolled alert

    Examples:
      | mnemonic                                                                            |
      | denial kitchen pet squirrel other broom bar gas better priority spoil cross         |