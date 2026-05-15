import pLimit from "p-limit";
import Database from "services/database";
import {
  normalizePageCustomerPhone,
  normalizePageCustomerPhoneNumbers
} from "services/pancake/sync/page-customer-phone-normalize";

const BATCH_SIZE = 300;
const CONCURRENCY_LIMIT = 15;

export default async function backfillPageCustomerPhoneNormalize(env: any): Promise<void> {
  const db = Database.instance(env);
  const limit = pLimit(CONCURRENCY_LIMIT);

  let offset = 0;

  while (true) {
    const rows = await db.page_customer.findMany({
      take: BATCH_SIZE,
      skip: offset,
      where: {
        phone: {
          not: null
        }
      },
      orderBy: { uuid: "asc" },
      select: {
        uuid: true,
        phone: true,
        phone_numbers: true
      }
    });

    if (!rows.length) break;

    await Promise.all(
      rows.map((row) =>
        limit(() =>
          db.page_customer.update({
            where: { uuid: row.uuid },
            data: {
              normalized_phone: normalizePageCustomerPhone(row.phone),
              normalized_phone_numbers: normalizePageCustomerPhoneNumbers(row.phone_numbers)
            }
          })
        )
      )
    );

    offset += rows.length;
  }
}
