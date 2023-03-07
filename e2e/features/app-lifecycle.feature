@app-lifecycle
Feature: App Lifecycle

  Scenario: User starts app from new install
    Given The user has installed the app
    And The user opens the app
    Then The user should see the welcome screen

  Scenario: User starts app from background
    Given The user brings the app from background
    Then The user should see the welcome screen

  Scenario: User restarts app
    Given The user closes the app
    And The user opens the app
    Then The user should see the welcome screen
