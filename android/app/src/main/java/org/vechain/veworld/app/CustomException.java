package org.vechain.veworld.app;

public class CustomException extends Exception {
    // You can add constructors and additional methods as needed
    public CustomException() {
        super("This is a custom exception message"); // Set a default message
    }

    public CustomException(String message) {
        super(message); // Set a custom message provided by the caller
    }
}
