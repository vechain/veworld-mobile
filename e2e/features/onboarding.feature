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
    And The user follows the onboarding process
    And The user selects to create a new wallet
    And The user follows the create wallet process
    Then The user can create wallet

  Scenario: User successfully creates a local wallet
    Given The app is opened
    And The user skips to creating a new local wallet
    And The user onboards with a new local wallet
    And The user chooses to protect the wallet with a password
    And The user enters a new password "<password>" and confirm password "<password>" 
    Then The user should see wallet success screen 

    Examples:
      | password     | 
      | 134679       | 


  Scenario:  User successfully imports a local wallet
    Given The app is opened
    And The user skips to import local wallet
    And The user imports a local wallet with the mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password
    And The user enters a new password "<password>" and confirm password "<password>" 
    Then The user should see wallet success screen

    Examples:
      | password     | mnemonic                                                                    |
      | 134679       | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  
  Scenario: User attemps to import a local wallet with an invalid mnemonic
    Given The app is opened
    And The user skips to import local wallet
    And The user imports a local wallet with the mnemonic "<mnemonic>"
    Then The user should not see wallet protection screen

    Examples:
      | mnemonic                                                                            |
      | denial denial denial denial denial denial denial denial denial denial denial denial |

  Scenario: User attemps to import a local wallet with an invalid password
    Given The app is opened
    And The user skips to import local wallet
    And The user imports a local wallet with the mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with a password
    And The user enters a new password "<password>" and confirm password "<confirmPassword>" 
    Then The user should not see wallet success screen

    Examples:
      | password     | confirmPassword     | mnemonic                                                                    |
      | 134679       | 111111              | denial kitchen pet squirrel other broom bar gas better priority spoil cross |

  Scenario:  User successfully imports a local wallet and chooses biometric protection
    Given The app is opened and is iOS and has biometrics authorization
    And The user skips to import local wallet
    And The user imports a local wallet with the mnemonic "<mnemonic>"
    And The user chooses to protect the wallet with biometrics
    Then The user should see wallet success screen

    Examples:
      | password     | mnemonic                                                                    |
      | 134679       | denial kitchen pet squirrel other broom bar gas better priority spoil cross |