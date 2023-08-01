Feature: The user send tokens in test net

  Background:
    * The app is opened
    * Open with demo account
    * The user has more than one account
    * The user selects Account 1
    * The user selects the test network
    * The user clicks back button
    * The user goes to home tab
    * The user is in the send screen

  Scenario: User should be able to send tokens
    When The user selects "<token>" token to be sent
    And The user inserts the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user inserts the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user can click confirm button
    And The user inserts password "<password>"
    Then The user should see successfully sent message for the token "<token>"

    Examples:
      | token | amount | address                                    | password |
      | VET   | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   |
      | VTHO  | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   |

  Scenario: User should be able to send tokens delegating with account method
    When The user selects "<token>" token to be sent
    And The user inserts the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user inserts the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user selects Account as delegation method
    And The user selects the account "<delegationAccount>" from the list
    And The user can click confirm button
    And The user inserts password "<password>"
    Then The user should see successfully sent message for the token "<token>"

    Examples:
      | token | amount | address                                    | password | delegationAccount |
      | VET   | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   | Account 2         |
      | VTHO  | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   | Account 2         |


  Scenario: User should be able to send tokens delegating with url method
    When The user selects "<token>" token to be sent
    And The user inserts the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user inserts the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user selects URL as delegation method
    And The user inserts a new url "<url>"
    And The user can click confirm button
    And The user inserts password "<password>"
    Then The user should see successfully sent message for the token "<token>"

    Examples:
      | token | amount | address                                    | password | url                                           |
      | VET   | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   | https://sponsor-testnet.vechain.energy/by/226 |
      | VTHO  | 1      | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 111111   | https://sponsor-testnet.vechain.energy/by/226 |

  Scenario: User should be able to send custom tokens
    When The user clicks back button
    When The user go to tokens management screen
    And The user add a custom token with address "<tokenAddress>"
    And The user clicks back button
    And The user is in the send screen
    And The user selects "<token>" token to be sent
    And The user inserts the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user inserts the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user can click confirm button
    And The user inserts password "<password>"
    Then The user should see successfully sent message for the token "<token>"

    Examples:
      | token | amount | address                                    | tokenAddress                               | password |
      | CARP  | 10     | 0x435933c8064b4Ae76bE665428e0307eF2cCFBD68 | 0x8a9844e4750f5ce5f7988c4d1e04c278c718feea | 111111   |

  Scenario: Give back tokens to account 1
    When The user clicks back button
    And The user selects Account 2
    And The user is in the send screen
    And The user selects "<token>" token to be sent
    And The user inserts the amount "<amount>" to be sent
    And The user can click next button to go to the next screen
    And The user inserts the address "<address>" of the receiver
    And The user can click next button to go to the next screen
    And The user can click confirm button
    And The user inserts password "<password>"
    Then The user should see successfully received message for the token "<token>"

    Examples:
      | token | amount | address                                    | password |
      | VET   | 3      | 0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa | 111111   |
      | VTHO  | 3      | 0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa | 111111   |

  Scenario: User should not get error for small amount (#557) on the send flow
    When The user selects "<token>" token to be sent
    And The user inserts a very small amount to be sent
    Then The user can click next button to go to the next screen

    Examples:
      | token   |
      | Vechain |

  Scenario: User should should be able to insert comma (#561) on the send flow
    When The user selects "<token>" token to be sent
    And The user inserts a comma on the amount to be sent
    Then The user sees the amount with the comma converted to a dot

    Examples:
      | token   |
      | Vechain |
