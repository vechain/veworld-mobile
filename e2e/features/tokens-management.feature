Feature: The user can manage tokens

  Background:
    * The app is opened
    * The user has previously onboarded
    * The user is in the tokens management screen

  Scenario: User select an official token
    When The user select plair token from the unselected tokens list
    Then The user should see plair token balance in home screen

