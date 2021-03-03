# Beyond Rule 4

[Live Site](https://beyondrule4.jmmorrissey.com)

This project is a Financial Independence forecasting tool built with the intent of using the YNAB API.

It ended up getting an [honorable mention](https://www.youneedabudget.com/announcing-the-ynab-api-contest-winners/). Not too shabby. 

# Dev Instructions

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Running the application in Docker

In order to successfully authenticate with YNAB, you will need a [YNAB API OAuth Application Token](https://api.youneedabudget.com/). Your Client ID and Redirect URI(s) will used when running your container. 

Build the container:

```shell
$ docker build -t br4 .
```

Then run the container:

```shell
$ docker run --name br4 -d -p 8080:80 --env APP_URL="http://localhost:8080" --env CLIENT_ID="<CLIENT_ID_FROM_YNAB>" br4
```

Navigate to http://localhost:8080 to view the application. Note: This example uses port 8080, which will be required in the Redirect URI when registering your OAuth application. You are free to use other ports.