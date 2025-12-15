export default class CustomerSerializer {
  static filteredPII(customer) {
    if (!customer) return null;

    return {
      haravan_id: customer.haravan_id,
      customer_name: customer.customer_name,
      rank: customer.rank,
      total_cumulative_revenue: customer.total_cumulative_revenue,
      rank_updated_at: customer.rank_updated_at,
      priority_login_date: customer.priority_login_date,
      rank_score_12m: customer.rank_score_12m,
      partner_role: customer.partner_role,
      actual_cumulative_revenue: customer.actual_cumulative_revenue,
      referral_cumulative_revenue: customer.referral_cumulative_revenue,
      buyback_revenue: customer.buyback_revenue,
      total_referral_point: customer.total_referral_point,
      available_point_amount: customer.available_point_amount,
      withdraw_point: customer.withdraw_point,
      withdraw_cash_amount: customer.withdraw_cash_amount,
      withdraw_cash_amount_pending: customer.withdraw_cash_amount_pending,
      priority_bank_account: customer.priority_bank_account
    };
  }
}
