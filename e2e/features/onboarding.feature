Feature: User Onboarding

  Scenario: User can onboard
    Given The user opens the app
    And The user follows the onboarding process
    Then The user should be onboarded

  Scenario: User can skip to password creation
    Given The user opens the app
    And The user skips to password creation
    Then The user should see password creation

  # Scenario: User can create wallet
  #   Given The user opens the app
  #   And The user follows the onboarding process
  #   And The user follows the wallet creation process
  #   Then The user can create wallet

  Scenario: User can skip to recovery phase
    Given The user opens the app
    And The user follows the onboarding process
    And The user skips to recovery phase
    Then The user can create wallet
