# Agent Assist UI

Agent Assist UI is POC project, for agent

## Getting started

To get a copy of this app, execute the following commands:

```sh
git clone https://git.omilia.com/poc/agent-assist.git
cd agetnt-assist/frontend
yarn
yarn dev
```

...and that's it! your project now runs on `http://localhost:5173/`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Git workflow

Before creating a branch or commiting changes to the project please take a look at the following:
<https://engineering.pages.omilia.com/handbook/coding/frontend/git-workflow/overview/>



```sh
yarn test
```

Run tests for a specific file:

```sh
yarn test /path/to/yourFile.tsx
```


### Useful to know

`yarn lint` lints the project via eslint. Add `--fix` to fix whatever can be automatically fixed.

`yarn cypress open` runs Cypress e2e tests.

When running git add, git commit, git push there are some git hooks that are running like eslint, prettier, test. These are set up using lint-staged, husky, eslint, prettier packages. If you want to bypass these hooks you can add --no-verify as parameter to the command.




### Technologies

-- React
-- Typescript

## License

[Omilia proprietary license](https://omilia.com)

