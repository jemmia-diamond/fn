import { Env, Hono } from "hono";
import { Route } from "./route.type";
import { BlankEnv, BlankSchema, Schema } from "hono/types";

type AppToMount = App | { path: string; honoApp: Hono };

interface AppArgs {
  /**
   * Base path
   */
  path: string;

  /**
   * Route to register
   */
  routes?: (new () => Route)[];

  /**
   * Apps to mount
   */
  apps?: AppToMount[];
}

export class App<E extends Env = BlankEnv, S extends Schema = BlankSchema>  extends Hono<{ Bindings: E, Schema: S }> {
  private _path: string;

  public constructor(args: AppArgs) {
    super();
    this._path = args.path;

    if (args.routes) {
      this.registerRoutes(args.routes);
    }

    if (args.apps) {
      this.registerApps(args.apps);
    }

    return;
  }

  public get path() {
    return this._path;
  }

  public mountApp(app: App): void;
  public mountApp(path: string, app: App): void;

  /**
   * Mount an app to the current app
   * @param appOrPath Path or app to mount
   * @param app App to mount
   */
  public mountApp(appOrPath: string | App, app?: App) {
    if (typeof appOrPath === "string") {
      this.mount(appOrPath, app!.fetch);
    } else {
      this.mount(appOrPath.path, appOrPath.fetch);
    }
  }

  /**
   * Register apps to the current app
   * @param apps Apps to register
   */
  private registerApps(apps: AppToMount[]) {
    apps.forEach((app) => {
      if (app instanceof App) {
        this.mountApp(app);
      } else if (app.honoApp) {
        this.mount(app.path, app.honoApp.fetch);
      }
    });
  }

  /**
   * Register route to the current app
   * @param route route to register
   */
  private registerRoutes(_routes: (new () => Route)[]) {
    _routes.forEach((route) => {
      const instance = new route();
      this.route(instance.basePath, instance.app);
    });
  }
}
