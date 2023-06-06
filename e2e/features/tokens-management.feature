Feature: The user can manage tokens

  Background:
    * The app is opened
    * Open with demo account
    * The user go to tokens management screen

  Scenario: User select an official token
    When The user selects "<token>" token from the unselected tokens list
    Then The user should see "<token>" token balance in home screen

    Examples:
      | token |
      | Plair |

  Scenario: User select multiple official tokens
    When The user selects "<token>" and "<token2>" tokens from the unselected tokens list
    Then The user should see "<token>" and "<token2>" token balances in home screen

    Examples:
      | token      | token2  |
      | Safe Haven | TicTalk |

  Scenario: User can unselect official tokens
    When The user selects "<token>" and "<token2>" tokens from the unselected tokens list
    And The user unselect "<token>"
    Then The user should not see "<token>" token balance in home screen

    Examples:
      | token      | token2  |
      | Safe Haven | TicTalk |

  Scenario: User search for a token
    When The user type the query "<query>"
    Then The list should display "<token>" and not "<token2>"

    Examples:
      | query | token | token2  |
      | Plair | Plair | TicTalk |

  Scenario: User add a custom token
    When The user add a custom token with address "<address>"
    Then The user should see "<token>" custom token balance in home screen

    Examples:
      | address                                    | token     |
      | 0x34149f8da92222af599ba936d9089f5ce460b522 | CarpToken |

  Scenario: User add multiple custom tokens
    When The user add multiple custom tokens with address "<address1>" and "<address2>"
    Then The user should see "<token1>" and "<token2>" balances in home screen

    Examples:
      | address1                                   | token1    | address2                                   | token2  |
      | 0x34149f8da92222af599ba936d9089f5ce460b522 | CarpToken | 0xbd0e5d86fdd4bd6d249ceea1336594f6d959c099 | DavMain |

  Scenario: User add multiple custom tokens and delete one of them
    When The user add multiple custom tokens with address "<address1>" and "<address2>"
    And The user delete custom token "<token1>"
    Then The user should see "<token1>" but not "<token2>" in home screen

    Examples:
      | address1                                   | token1    | address2                                   | token2  |
      | 0x34149f8da92222af599ba936d9089f5ce460b522 | CarpToken | 0xbd0e5d86fdd4bd6d249ceea1336594f6d959c099 | DavMain |

  Scenario: When the user add an official token and then it change network (bug #570) it should not throw the error
    When The user selects "<token>" token from the unselected tokens list
    And The user clicks back button
    And The user selects the test network
    And The user clicks back button
    And The user goes to home tab
    And The user go to tokens management screen
    And The user selects "<token2>" token from the unselected tokens list
    And The user clicks back button
    And The user selects the main network
    And The user clicks back button
    And The user goes to home tab
    Then The user is in home screen

    Examples:
      | token | token2     |
      | Plair | Decent.bet |