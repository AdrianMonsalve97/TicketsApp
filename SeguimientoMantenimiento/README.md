# SeguimientoMantenimiento

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.16.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Deploying to Render

This repository includes a Render Blueprint at `../render.yaml` for deploying the Angular app as a Static Site.

Render settings:

```text
Service type: Static Site
Root directory: SeguimientoMantenimiento
Build command: npm ci && npm run render:build
Publish directory: dist/SeguimientoMantenimiento/browser
Rewrite: /* -> /index.html
```

Set this environment variable in Render:

```text
RENDER_API_BASE_URL=https://your-backend-service.onrender.com/api
```

For local development, `src/app/core/services/api.config.ts` defaults to `https://localhost:7002/api`. The Render build command regenerates that file using `RENDER_API_BASE_URL` before running `ng build`.

### GitHub Actions

The workflow at `../.github/workflows/frontend-render.yml` runs `npm ci && npm run render:build` for pull requests and pushes to `main`.

Optional GitHub configuration:

```text
Repository variable: RENDER_API_BASE_URL=https://your-backend-service.onrender.com/api
Repository secret: RENDER_DEPLOY_HOOK_URL=<Render deploy hook URL>
```

If `RENDER_DEPLOY_HOOK_URL` is present, pushes to `main` trigger a Render deploy hook after the Angular build succeeds. If it is not present, the workflow still validates the build and skips the deploy trigger.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
