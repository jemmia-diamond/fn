import { ILarksuiteAppointment } from "src/services/larksuite/appointment/types";
import Database from "services/database";

export const saveAppointmentToPrismaDb = async (
  env: any,
  dataRequest: ILarksuiteAppointment
) => {
  const db = Database.instance(env);
  const dataToSave = {
    store: dataRequest.store,
    name: dataRequest.name,
    phone_number: dataRequest.phone_number,
    gender: dataRequest.gender,
    product_images: dataRequest.product_images
      ? (dataRequest.product_images as any)
      : null,
    note: dataRequest.note,
    date_time: dataRequest.date_time,
    conversation_greeting: dataRequest.conversation_greeting,
    customer_response: dataRequest.customer_response,
    main_sales: dataRequest.main_sales ? (dataRequest.main_sales as any) : null,
    offline_sales: dataRequest.offline_sales
      ? (dataRequest.offline_sales as any)
      : null,
    status: dataRequest.status,
    policy: dataRequest.policy
  };

  await db.larksuiteAppointment.upsert({
    where: { record_id: dataRequest.record_id },
    update: dataToSave,
    create: {
      record_id: dataRequest.record_id,
      ...dataToSave
    }
  });
};
