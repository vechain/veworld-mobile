Feature: The user can manage transactions settings

  Background:
    * The app is opened
    * Open with demo account
    * The user has more than one account
    * The user is in settings screen
    * The user is in transactions settings screen

  Scenario: User can select an account as default delegation method for transactions
    When The user selects Account as delegation method
    And The user selects the account "<account>" from the list
    Then The user should see the delegation account "<account>" card

    Examples:
      | account   |
      | Account 1 |

  Scenario: User can select an URL as default delegation method for transactions
    When The user selects URL as delegation method
    And The user inserts a new url "<url>"
    Then The user should see the delegation url "<url>" card

    Examples:
      | url                                           |
      | https://sponsor-testnet.vechain.energy/by/218 |

  Scenario: User can create multiple delegation URLs
    When The user selects URL as delegation method
    And The user inserts a new url "<url1>"
    And The user selects URL as delegation method
    And The user should see the delegation url "<url1>" card
    And The user click plush button to add a new url
    And The user inserts a new url "<url2>"
    And The user should see the delegation url "<url2>" card
    And The user selects URL as delegation method
    Then The user should see the delegation url "<url2>" card
    Then The user can click the "<url1>" url card to select it

    Examples:
      | url1                                          | url2                                          |
      | https://sponsor-testnet.vechain.energy/by/218 | https://sponsor-testnet.vechain.energy/by/219 |


  Scenario: User can add a delegation URL with the Manage URLs button
    When The user click Manage URLs button
    And The user click the plus icon to add a new delegation url
    And The user inserts a new url "<url1>"
    Then The user should see the delegation url "<url1>" card

    Examples:
      | url1                                          |
      | https://sponsor-testnet.vechain.energy/by/218 |



  Scenario: User can add multiple delegation URLs with the Manage URLs button
    When The user click Manage URLs button
    And The user click the plus icon to add a new delegation url
    And The user inserts a new url "<url1>"
    And The user click the plus icon to add a new delegation url
    And The user inserts a new url "<url2>"
    Then The user should see the delegation url "<url1>" card
    Then The user should see the delegation url "<url2>" card

    Examples:
      | url1                                          | url2                                          |
      | https://sponsor-testnet.vechain.energy/by/218 | https://sponsor-testnet.vechain.energy/by/219 |

  Scenario: User can delete delegation URLs
    When The user click Manage URLs button
    And The user click the plus icon to add a new delegation url
    And The user inserts a new url "<url1>"
    And The user click the plus icon to add a new delegation url
    And The user inserts a new url "<url2>"
    And The user delete the delegation url "<url1>"
    Then The user should see the delegation url "<url2>" card
    Then The user should not see the delegation url "<url1>" card

    Examples:
      | url1                                          | url2                                          |
      | https://sponsor-testnet.vechain.energy/by/218 | https://sponsor-testnet.vechain.energy/by/219 |