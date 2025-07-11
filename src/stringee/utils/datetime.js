import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export const timestampToDatetime = (timestamp) => dayjs(timestamp).utc().format("YYYY-MM-DD HH:mm:ss");
