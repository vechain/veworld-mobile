Feature: The user can manage contacts

  Background:
    * The app is opened
    * The user has previously onboarded
    * The user is in the contacts management screen

  Scenario: User creates a new contact
    When The user adds a new contact name "<name>" and address "<address>"
    Then The user should see contact with name "<name>" in contacts list

    Examples:
      | name         | address                                    |
      | My Contact 1 | 0xB6108eA355B04867a68F294d6197b667789361A1 |

  Scenario: User attempts to create a new contact with an invalid address
    When The user adds a new contact name "<name>" and address "<address>"
    Then The user should see the address invalid error message

    Examples:
      | name         | address                                      |
      | My Contact 2 | 0xB6108eA355b04867A68F294d6197b667789361a12c |

  Scenario: User attemps to create a new contact with an address of an existing contact
    When The user adds a new contact name "<name>" and address "<address>"
    And The user adds a new contact name "<name2>" and address "<address>"
    Then The user should see the address exists error message

    Examples:
      | name         | name2        | address                                    |
      | My Contact 3 | My Contact 4 | 0xB6108eA355B04867A68f294d6197B667789361a2 |

  Scenario: User creates a new contact and deletes it
    When The user adds a new contact name "<name>" and address "<address>"
    And The user deletes the contact with name "<name>"
    Then The user should not see contact with name "<name>" in contacts list

    Examples:
      | name         | address                                    |
      | My Contact 5 | 0xb6108ea355B04867A68f294d6197B667789361a3 |

  Scenario: User creates a new contact and edits it
    When The user adds a new contact name "<name>" and address "<address>"
    And The user edits the contact with name "<name>" to name "<new_name>" and address "<new_address>"
    Then The user should see contact with name "<new_name>" and address "<new_address>" in contacts list

    Examples:
      | name         | new_name     | address                                    | new_address                                |
      | My Contact 6 | My Contact 7 | 0xB6108EA355B04867a68f294d6197b667789361A4 | 0xB6108Ea355B04867A68F294d6197b667789361a8 |

  Scenario: User creates a new contact and attempts to edit it to an existing contact address
    When The user adds a new contact name "<name>" and address "<address>"
    And The user adds a new contact name "<name2>" and address "<address2>"
    And The user edits the contact with name "<name2>" to name "<name>" and address "<address>"
    Then The user should see the address exists error message and click outside

    Examples:
      | name         | name2        | address                                    | address2                                   |
      | My Contact 8 | My Contact 9 | 0xb6108ea355B04867A68F294D6197B667789361a6 | 0xB6108Ea355B04867a68f294D6197b667789361a7 |

  Scenario: User adds many contacts and can scroll to view all of them
    When the user adds "<number_of_contacts>" contacts
    Then the user should be able to scroll to the contact "<name>"

    Examples:
      | number_of_contacts | name          |
      | 10                 | My Contact 19 |