Feature: The user send tokens in test net

  Background:
    * The app is opened
    * Open with demo account
    * The user has more than one account
    * The user select the test network
    * The user click back button
    * The user go to home tab
    * The user is in the send screen

  @Dev
  Scenario: User should be able to send tokens
    When The user select "<token>" token to be sent
    And The user insert the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user insert the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user can click confirm button
    And The user insert password "<password>"
    Then The user should see success message

    Examples:
      | token | amount | address                                    | password |
      | VET   | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   |
      | VTHO  | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   |


