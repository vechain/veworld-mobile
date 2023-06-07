Feature: The user can manage tokens

  Background:
    * The app is opened
    * Open with demo account
    * The user is in the send screen

  Scenario: User should not get error for small amount (#557) on the send flow
    When The user select "<token>" token to be sent
    And The user insert a very small amount to be sent
    Then The user can click next button to go to the next screen

    Examples:
      | token   |
      | Vechain |

  Scenario: User should should be able to insert comma (#561) on the send flow
    When The user select "<token>" token to be sent
    And The user insert a comma on the amount to be sent
    Then The user see the amount with the comma converted to a dot

    Examples:
      | token   |
      | Vechain |

