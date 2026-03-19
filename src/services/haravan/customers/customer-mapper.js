import dayjs from "dayjs";

export default class CustomerMapper {
  static mapCustomer(customer) {
    const defaultAddress = customer.default_address || {};

    return {
      id: customer.id,
      accepts_marketing: customer.accepts_marketing,
      default_address: customer.default_address,
      addresses: customer.addresses,
      address_address1: defaultAddress.address1,
      address_address2: defaultAddress.address2,
      address_city: defaultAddress.city,
      address_company: defaultAddress.company,
      address_country: defaultAddress.country,
      address_country_code: defaultAddress.country_code,
      address_id: defaultAddress.id ? BigInt(defaultAddress.id) : null,
      address_first_name: defaultAddress.first_name,
      address_last_name: defaultAddress.last_name,
      address_phone: defaultAddress.phone,
      address_province: defaultAddress.province,
      address_province_code: defaultAddress.province_code,
      address_zip: defaultAddress.zip,
      address_name: defaultAddress.name,
      address_default: defaultAddress.default,
      address_district: defaultAddress.district,
      address_district_code: defaultAddress.district_code,
      address_ward: defaultAddress.ward,
      address_ward_code: defaultAddress.ward_code,
      email: customer.email,
      phone: customer.phone,
      first_name: customer.first_name,
      last_name: customer.last_name,
      created_at: customer.created_at ? dayjs(customer.created_at).toDate() : null,
      updated_at: customer.updated_at ? dayjs(customer.updated_at).toDate() : null,
      multipass_identifier: customer.multipass_identifier,
      last_order_id: customer.last_order_id ? BigInt(customer.last_order_id) : null,
      last_order_name: customer.last_order_name,
      published: customer.published,
      note: customer.note,
      orders_count: customer.orders_count,
      state: customer.state,
      tags: customer.tags,
      total_spent: customer.total_spent,
      total_paid: customer.total_paid,
      verified_email: customer.verified_email,
      group_name: customer.group_name,
      birthday: customer.birthday ? dayjs(customer.birthday).toDate() : null,
      gender: customer.gender
    };
  }
}
