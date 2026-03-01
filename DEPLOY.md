# Deploy to Fly.io

Prior to your first deployment, you'll need to [Install Fly CLI][fly-cli].

## Turso Database

```sh
turso auth login
turso group create personal --location sin

# Staging database
turso db create better-start-stg
turso db show better-start-stg
turso db tokens create better-start-stg

# Production database
turso db create better-start-prd
turso db show better-start-prd
turso db tokens create better-start-prd
```

## Login to Fly

```sh
fly auth login
```

> **Note:** If you have more than one Fly account, ensure that you are signed into the same
> account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami`
> and ensure the email matches the Fly account signed into the browser.

## Create Fly application

```sh
fly apps create --org personal --name better-start-stg
fly apps create --org personal --name better-start-prd
```

> **Note:** Make sure this name matches the `app` set in your `fly.toml` file.
> Otherwise, you will not be able to deploy.

## Store the dotenv values

<!--
fly secrets set --stage FAS_TEMPORAL_CERT_DATA="$(<ca.pem)"
fly secrets set --stage FAS_TEMPORAL_KEY_DATA="$(<ca.key)"
-->

```sh
fly -c fly.stg.toml secrets set $(cat .env.staging | xargs -I %s echo %s) --stage
fly -c fly.prd.toml secrets set $(cat .env.production | xargs -I %s echo %s) --stage
```

## Deploy the application:

```sh
fly -c fly.stg.toml deploy --ha=false
fly -c fly.prd.toml deploy --ha=false
```

The application will available at:

- Production URL: [better-start.app](https://better-start.app)
- Staging URL: [dev.better-start.app](https://dev.better-start.app)

Go to the [documentation][flyctl-docs] for more information about Fly CLI.

## Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of the steps above
and if you have, then post as many details about your deployment (including your app name) to
[the Fly support community](https://community.fly.io). They're normally pretty responsive over
there and hopefully can help resolve any of your deployment issues and questions.

## Deploy to Unikraft Cloud

Reference: https://unikraft.cloud/docs/cli/deploy/

```sh
kraft cloud deploy --metro sin0 -p 443:3000 . --name better-start-stg \
  --subdomain better-start-stg -M 768M --replicas 1
```

[fly-cli]: https://fly.io/docs/getting-started/installing-flyctl
[flyctl-docs]: https://fly.io/docs/flyctl
