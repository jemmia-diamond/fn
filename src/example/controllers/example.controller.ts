import { Controller, Get, Post, Use } from "@asla/hono-decorator";
import { Context } from "hono";
import { validate } from "../../core/middleware/validate.middleware";
import { ExamplePayload } from "../dto/example.dto";

@Controller({})
export class ExampleController {
    @Get('/hello')
    public hello(ctx: Context) {
        return ctx.text('HELLO!');
    }

    @Use(validate('json', ExamplePayload))
    @Post('/hello')
    public helloPost(ctx: Context) {
        return ctx.text('HELLO!');
    }
}
