# Examples of how to invoke the build lane

### Build for interanl consumption

On the terminal inside the ios directory:

`fastlane build username:<your github username> token:<your personal access token>`

if you want to specifically set a build number you should write:

`fastlane build username:<your github username> token:<your personal access token> build:<set the build number>`

### Build for official release

`fastlane build username:<your github username> token:<your personal access token> version:<possible values : "patch", "minor", "major" "1.0.0">`

or

`fastlane build username:<your github username> token:<your personal access token> version:<possible values : "patch", "minor", "major" "1.0.0"> build:<set the build number>`
