# Releasing

## When you want to create a new release, follow these steps

* Update the version in your project's package.json file (e.g. 1.2.3)
* Commit that change (git commit -am v1.2.3)
* Tag your commit (git tag v1.2.3). Make sure your tag name's format is v*.*.*. Your workflow will use this tag to detect when to create a release
* Push your changes to GitHub (git push && git push --tags)
