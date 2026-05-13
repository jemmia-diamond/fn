import Database from "services/database";
import {
  normalizePageCustomerPhone,
  normalizePageCustomerPhoneNumbers
} from "services/pancake/sync/page-customer-phone-normalize";

const BATCH_SIZE = 300;

export default async function backfillPageCustomerPhoneNormalize(env: any): Promise<void> {
  const db = Database.instance(env);
  let lastUuid: string | null = null;

  while (true) {
    const rows = await db.page_customer.findMany({
      take: BATCH_SIZE,
      ...(lastUuid ? { skip: 1, cursor: { uuid: lastUuid } } : {}),
      orderBy: { uuid: "asc" },
      select: {
        uuid: true,
        phone: true,
        phone_numbers: true
      }
    });

    if (rows.length === 0) break;

    await Promise.all(
      rows.map((row) =>
        db.page_customer.update({
          where: { uuid: row.uuid },
          data: {
            phone_normalize: normalizePageCustomerPhone(row.phone),
            phone_numbers_normalize: normalizePageCustomerPhoneNumbers(row.phone_numbers)
          }
        })
      )
    );

    lastUuid = rows[rows.length - 1].uuid;

    if (rows.length < BATCH_SIZE) break;
  }
}
