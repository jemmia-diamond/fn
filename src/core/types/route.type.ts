import { BlankEnv, BlankInput, H } from "hono/types";
import { Hono } from "hono";

export class Route {
    private _basePath: string;
    private _app: Hono;

    public constructor(basePath: string) {
        this._basePath = basePath;
        this._app = new Hono();

        this._app.basePath(this._basePath);
    }

    public get app(): Hono {
        return this._app;
    }

    public get basePath(): string {
        return this._basePath;
    }

    public get(path: string, ...handlers: H<BlankEnv, string, BlankInput, unknown>[]) {
        return this._app.get(path, ...handlers);
    }

    public post(path: string, ...handlers: H<BlankEnv, string, BlankInput, unknown>[]) {
        return this._app.post(path, ...handlers);
    }

    public put(path: string, ...handlers: H<BlankEnv, string, BlankInput, unknown>[]) {
        return this._app.put(path, ...handlers);
    }

    public delete(path: string, ...handlers: H<BlankEnv, string, BlankInput, unknown>[]) {
        return this._app.delete(path, ...handlers);
    }

    public patch(path: string, ...handlers: H<BlankEnv, string, BlankInput, unknown>[]) {
        return this._app.patch(path, ...handlers);
    }
}
