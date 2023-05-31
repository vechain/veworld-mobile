Feature: The user can manage tokens

  Background:
    * The app is opened
    * Open with demo account
    * The user is in the send screen

  Scenario: User should not get error for small amount (#557)
    When The user select "<token>" token to be sent
    And The user insert a very small amount to be sent
    Then The user can click next button to go to the next screen

    Examples:
      | token   |
      | Vechain |

