import { safeValue } from "src/services/utils/data-mappers";

export const mapCustomersToDatabase = (customers) => {
  return customers.map((customer) => ({
    name: safeValue(customer.name, "string"),
    owner: safeValue(customer.owner, "string"),
    creation: safeValue(customer.creation, "date"),
    modified: safeValue(customer.modified, "date"),
    modified_by: safeValue(customer.modified_by, "string"),
    docstatus: safeValue(customer.docstatus, "number"),
    idx: safeValue(customer.idx, "number"),
    naming_series: safeValue(customer.naming_series, "string"),
    salutation: safeValue(customer.salutation, "string"),
    customer_name: safeValue(customer.customer_name, "string"),
    customer_group: safeValue(customer.customer_group, "string"),
    bizfly_customer_number: safeValue(
      customer.bizfly_customer_number,
      "string"
    ),
    is_internal_customer: safeValue(customer.is_internal_customer, "number"),
    customer_type: safeValue(customer.customer_type, "string"),
    customer_rank: safeValue(customer.customer_rank, "string"),
    account_manager: safeValue(customer.account_manager, "string"),
    lead_name: safeValue(customer.lead_name, "string"),
    opportunity_name: safeValue(customer.opportunity_name, "string"),
    territory: safeValue(customer.territory, "string"),
    prospect_name: safeValue(customer.prospect_name, "string"),
    company_name: safeValue(customer.company_name, "string"),
    no_of_employees: safeValue(customer.no_of_employees, "number"),
    industry: safeValue(customer.industry, "string"),
    market_segment: safeValue(customer.market_segment, "string"),
    tax_number: safeValue(customer.tax_number, "string"),
    ceo_name: safeValue(customer.ceo_name, "string"),
    personal_document_type: safeValue(
      customer.personal_document_type,
      "string"
    ),
    birth_date: safeValue(customer.birth_date, "date"),
    gender: safeValue(customer.gender, "string"),
    personal_id: safeValue(customer.personal_id, "string"),
    place_of_issuance: safeValue(customer.place_of_issuance, "string"),
    person_name: safeValue(customer.person_name, "string"),
    date_of_issuance: safeValue(customer.date_of_issuance, "date"),
    first_source: safeValue(customer.first_source, "string"),
    customer_website: safeValue(customer.customer_website, "string"),
    customer_journey: safeValue(customer.customer_journey, "string"),
    default_currency: safeValue(customer.default_currency, "string"),
    default_bank_account: safeValue(customer.default_bank_account, "string"),
    default_price_list: safeValue(customer.default_price_list, "string"),
    represents_company: safeValue(customer.represents_company, "number"),
    customer_pos_id: safeValue(customer.customer_pos_id, "string"),
    website: safeValue(customer.website, "string"),
    language: safeValue(customer.language, "string"),
    customer_details: safeValue(customer.customer_details, "string"),
    customer_primary_address: safeValue(
      customer.customer_primary_address,
      "string"
    ),
    primary_address: safeValue(customer.primary_address, "string"),
    image: safeValue(customer.image, "string"),
    customer_primary_contact: safeValue(
      customer.customer_primary_contact,
      "string"
    ),
    primary_contact: safeValue(customer.primary_contact, "string"),
    mobile_no: safeValue(customer.mobile_no, "string"),
    email_id: safeValue(customer.email_id, "string"),
    phone: safeValue(customer.phone, "string"),
    invoice_type: safeValue(customer.invoice_type, "string"),
    vat_email: safeValue(customer.vat_email, "string"),
    vat_name: safeValue(customer.vat_name, "string"),
    vat_address: safeValue(customer.vat_address, "string"),
    personal_tax_id: safeValue(customer.personal_tax_id, "string"),
    bank_account: safeValue(customer.bank_account, "string"),
    payment_terms: safeValue(customer.payment_terms, "string"),
    loyalty_program: safeValue(customer.loyalty_program, "string"),
    loyalty_program_tier: safeValue(customer.loyalty_program_tier, "string"),
    rank: safeValue(customer.rank, "string"),
    purchase_amount_last_12_months: safeValue(
      customer.purchase_amount_last_12_months,
      "number"
    ),
    rank_expired_date: safeValue(customer.rank_expired_date, "date"),
    priority_login_date: safeValue(customer.priority_login_date, "date"),
    cumulative_revenue: safeValue(customer.cumulative_revenue, "number"),
    cashback: safeValue(customer.cashback, "number"),
    true_cumulative_revenue: safeValue(
      customer.true_cumulative_revenue,
      "number"
    ),
    withdraw_cashback: safeValue(customer.withdraw_cashback, "number"),
    referrals_revenue: safeValue(customer.referrals_revenue, "number"),
    pending_cashback: safeValue(customer.pending_cashback, "number"),
    priority_bank_account: safeValue(customer.priority_bank_account, "string"),
    default_sales_partner: safeValue(customer.default_sales_partner, "string"),
    default_commission_rate: safeValue(
      customer.default_commission_rate,
      "number"
    ),
    so_required: safeValue(customer.so_required, "number"),
    dn_required: safeValue(customer.dn_required, "number"),
    is_frozen: safeValue(customer.is_frozen, "number"),
    disabled: safeValue(customer.disabled, "number"),
    haravan_id: safeValue(customer.haravan_id, "string"),
    bizfly_id: safeValue(customer.bizfly_id, "string"),
    tax_id: safeValue(customer.tax_id, "string"),
    tax_category: safeValue(customer.tax_category, "string"),
    tax_withholding_category: safeValue(
      customer.tax_withholding_category,
      "string"
    ),
    account: customer.account || null,
    portal_users: customer.portal_users || null,
    companies: customer.companies || null,
    sales_team: customer.sales_team || null,
    coupon_table: customer.coupon_table || null,
    credit_limits: customer.credit_limits || null
  }));
};
