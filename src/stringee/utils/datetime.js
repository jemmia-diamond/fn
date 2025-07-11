import dayjs from "dayjs";

export const timestampToDatetime = (timestamp) => dayjs(timestamp).subtract(7, "hour").format("YYYY-MM-DD HH:mm:ss");
