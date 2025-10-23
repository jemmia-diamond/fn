import { applyController } from "@asla/hono-decorator";
import { Hono } from "hono";

type AppToMount = App | { path: string, honoApp: Hono };

interface AppArgs {
    /**
     * Base path
     */
    path: string;

    /**
     * Controllers to register
     */
    controllers?: (new () => object)[];

    /**
     * Apps to mount
     */
    apps?: AppToMount[];
}

export class App extends Hono {
    private _path: string;

    public constructor(args: AppArgs) {
        super();
        this._path = args.path;
        
        if (args.controllers) {
            this.registerControllers(args.controllers);
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
        if (typeof appOrPath === 'string') {
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
     * Register controllers to the current app
     * @param controllers Controllers to register
     */
    private registerControllers(controllers: (new () => object)[]) {
        controllers.forEach((controller) => {
            applyController(this, new controller());
        });
    }
}
