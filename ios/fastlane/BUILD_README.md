# IOS Build

### Build for internal consumption

On the terminal inside the ios directory:

```bash
fastlane build username:<your github username> token:<your personal access token>
```

if you want to specifically set a build number you should write:

```bash
fastlane build username:<your github username> token:<your personal access token> build:<set the build number>
```

### Build for official release

```bash
fastlane build username:<your github username> token:<your personal access token> version:<possible values : "patch", "minor", "major" "1.0.0">
```

or

```bash
fastlane build username:<your github username> token:<your personal access token> version:<possible values : "patch", "minor", "major" "1.0.0"> build:<set the build number>
```
