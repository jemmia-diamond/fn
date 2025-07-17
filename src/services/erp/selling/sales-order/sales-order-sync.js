import FrappeClient from "../../../../frappe/frappe-client.js";
import Database from "../../../database.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class SalesOrderSyncService {
  constructor(env) {
    this.env = env;
    this.doctype = "Sales Order";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  // 1. Function to fetch Sales Orders from ERPNext
  async fetchSalesOrdersFromERP(fromDate, toDate = null) {
    try {
      const filters = {};
      filters['modified'] = ['>=', fromDate];
      
      if (toDate) {
        filters['modified'] = ['between', [fromDate, toDate]];
      }

      let allSalesOrders = [];
      let start = 0;
      const pageSize = 1000; // Fetch 1000 records per batch
      let hasMoreData = true;

      while (hasMoreData) {
        console.log(`🔄 Fetching Sales Orders batch ${Math.floor(start/pageSize) + 1} (from ${start})`);
        
        const salesOrdersBatch = await this.frappeClient.getList(this.doctype, {
          filters: filters,
          limit_start: start,
          limit_page_length: pageSize,
          order_by: "creation desc"
        });

        if (salesOrdersBatch && salesOrdersBatch.length > 0) {
          allSalesOrders.push(...salesOrdersBatch);
          start += pageSize;
          
          // If we got less than pageSize, we've reached the end
          if (salesOrdersBatch.length < pageSize) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }

      console.log(`✅ Total fetched ${allSalesOrders.length} Sales Orders`);
      return allSalesOrders;
      
    } catch (error) {
      console.error("❌ Error fetching Sales Orders from ERPNext:", error);
      throw error;
    }
  }

  // 2. Function to fetch Sales Order details from ERPNext
  async fetchSalesOrderDetails(salesOrderName) {
    try {
      const salesOrder = await this.frappeClient.getDoc(this.doctype, salesOrderName);
      return salesOrder;
    } catch (error) {
      console.error(`❌ Error fetching Sales Order details for ${salesOrderName}:`, error);
      return null;
    }
  }

  // 3. Function to save sales order to database
  async saveSalesOrderToDatabase(salesOrder) {
    try {
      // Map ERPNext fields to database structure based on Prisma schema
      const salesOrderData = {
        name: salesOrder.name || null,
        owner: salesOrder.owner || null,
        creation: salesOrder.creation ? new Date(salesOrder.creation) : null,
        modified: salesOrder.modified ? new Date(salesOrder.modified) : null,
        modified_by: salesOrder.modified_by || null,
        docstatus: salesOrder.docstatus || 0,
        idx: salesOrder.idx || null,
        title: salesOrder.title || null,
        naming_series: salesOrder.naming_series || null,
        tax_id: salesOrder.tax_id || null,
        order_type: salesOrder.order_type || null,
        skip_delivery_note: salesOrder.skip_delivery_note || 0,
        delivery_date: salesOrder.delivery_date ? new Date(salesOrder.delivery_date) : null,
        po_no: salesOrder.po_no || null,
        po_date: salesOrder.po_date ? new Date(salesOrder.po_date) : null,
        company: salesOrder.company || null,
        amended_from: salesOrder.amended_from || null,
        customer_name: salesOrder.customer_name || null,
        order_number: salesOrder.order_number || null,
        transaction_date: salesOrder.transaction_date ? new Date(salesOrder.transaction_date) : null,
        real_order_date: salesOrder.real_order_date ? new Date(salesOrder.real_order_date) : null,
        cancelled_status: salesOrder.cancelled_status || null,
        financial_status: salesOrder.financial_status || null,
        fulfillment_status: salesOrder.fulfillment_status || null,
        cost_center: salesOrder.cost_center || null,
        project: salesOrder.project || null,
        currency: salesOrder.currency || 'VND',
        conversion_rate: salesOrder.conversion_rate ? parseFloat(salesOrder.conversion_rate) : null,
        selling_price_list: salesOrder.selling_price_list || null,
        price_list_currency: salesOrder.price_list_currency || null,
        plc_conversion_rate: salesOrder.plc_conversion_rate ? parseFloat(salesOrder.plc_conversion_rate) : null,
        ignore_pricing_rule: salesOrder.ignore_pricing_rule || 0,
        scan_barcode: salesOrder.scan_barcode || null,
        set_warehouse: salesOrder.set_warehouse || null,
        reserve_stock: salesOrder.reserve_stock || 0,
        apply_discount_on: salesOrder.apply_discount_on || null,
        base_discount_amount: salesOrder.base_discount_amount ? parseFloat(salesOrder.base_discount_amount) : null,
        coupon_code: salesOrder.coupon_code || null,
        additional_discount_percentage: salesOrder.additional_discount_percentage ? parseFloat(salesOrder.additional_discount_percentage) : null,
        total_qty: salesOrder.total_qty ? parseFloat(salesOrder.total_qty) : null,
        total: salesOrder.total ? parseFloat(salesOrder.total) : null,
        discount_amount: salesOrder.discount_amount ? parseFloat(salesOrder.discount_amount) : null,
        grand_total: salesOrder.grand_total ? parseFloat(salesOrder.grand_total) : null,
        base_total: salesOrder.base_total ? parseFloat(salesOrder.base_total) : null,
        base_net_total: salesOrder.base_net_total ? parseFloat(salesOrder.base_net_total) : null,
        total_net_weight: salesOrder.total_net_weight ? parseFloat(salesOrder.total_net_weight) : null,
        net_total: salesOrder.net_total ? parseFloat(salesOrder.net_total) : null,
        tax_category: salesOrder.tax_category || null,
        taxes_and_charges: salesOrder.taxes_and_charges || null,
        shipping_rule: salesOrder.shipping_rule || null,
        incoterm: salesOrder.incoterm || null,
        named_place: salesOrder.named_place || null,
        base_total_taxes_and_charges: salesOrder.base_total_taxes_and_charges ? parseFloat(salesOrder.base_total_taxes_and_charges) : null,
        total_taxes_and_charges: salesOrder.total_taxes_and_charges ? parseFloat(salesOrder.total_taxes_and_charges) : null,
        base_grand_total: salesOrder.base_grand_total ? parseFloat(salesOrder.base_grand_total) : null,
        base_rounding_adjustment: salesOrder.base_rounding_adjustment ? parseFloat(salesOrder.base_rounding_adjustment) : null,
        base_rounded_total: salesOrder.base_rounded_total ? parseFloat(salesOrder.base_rounded_total) : null,
        base_in_words: salesOrder.base_in_words || null,
        rounding_adjustment: salesOrder.rounding_adjustment ? parseFloat(salesOrder.rounding_adjustment) : null,
        rounded_total: salesOrder.rounded_total ? parseFloat(salesOrder.rounded_total) : null,
        in_words: salesOrder.in_words,
        advance_paid: salesOrder.advance_paid ? parseFloat(salesOrder.advance_paid) : null,
        disable_rounded_total: salesOrder.disable_rounded_total || 0,
        other_charges_calculation: salesOrder.other_charges_calculation || null,
        contact_person: salesOrder.contact_person || null,
        contact_display: salesOrder.contact_display || null,
        contact_phone: salesOrder.contact_phone || null,
        contact_mobile: salesOrder.contact_mobile || null,
        contact_email: salesOrder.contact_email || null,
        customer_address: salesOrder.customer_address || null,
        address_display: salesOrder.address_display || null,
        customer_group: salesOrder.customer_group || null,
        territory: salesOrder.territory || null,
        shipping_address_name: salesOrder.shipping_address_name || null,
        shipping_address: salesOrder.shipping_address || null,
        customer: salesOrder.customer || null,
        gender: salesOrder.gender || null,
        customer_personal_id: salesOrder.customer_personal_id || null,
        birth_date: salesOrder.birth_date ? new Date(salesOrder.birth_date) : null,
        date_of_issuance: salesOrder.date_of_issuance ? new Date(salesOrder.date_of_issuance) : null,
        dispatch_address: salesOrder.dispatch_address || null,
        place_of_issuance: salesOrder.place_of_issuance || null,
        dispatch_address_name: salesOrder.dispatch_address_name || null,
        company_address: salesOrder.company_address || null,
        company_address_display: salesOrder.company_address_display || null,
        company_contact_person: salesOrder.company_contact_person || null,
        status: salesOrder.status || null,
        delivery_status: salesOrder.delivery_status || null,
        per_delivered: salesOrder.per_delivered ? parseFloat(salesOrder.per_delivered) : null,
        per_billed: salesOrder.per_billed ? parseFloat(salesOrder.per_billed) : null,
        per_picked: salesOrder.per_picked ? parseFloat(salesOrder.per_picked) : null,
        billing_status: salesOrder.billing_status || null,
        sales_partner: salesOrder.sales_partner || null,
        amount_eligible_for_commission: salesOrder.amount_eligible_for_commission ? parseFloat(salesOrder.amount_eligible_for_commission) : null,
        commission_rate: salesOrder.commission_rate ? parseFloat(salesOrder.commission_rate) : null,
        total_commission: salesOrder.total_commission ? parseFloat(salesOrder.total_commission) : null,
        loyalty_points: salesOrder.loyalty_points ? parseFloat(salesOrder.loyalty_points) : null,
        loyalty_amount: salesOrder.loyalty_amount ? parseFloat(salesOrder.loyalty_amount) : null,
        from_date: salesOrder.from_date ? new Date(salesOrder.from_date) : null,
        to_date: salesOrder.to_date ? new Date(salesOrder.to_date) : null,
        auto_repeat: salesOrder.auto_repeat || null,
        letter_head: salesOrder.letter_head || null,
        group_same_items: salesOrder.group_same_items || 0,
        select_print_heading: salesOrder.select_print_heading || null,
        language: salesOrder.language || null,
        is_internal_customer: salesOrder.is_internal_customer || 0,
        represents_company: salesOrder.represents_company || null,
        source: salesOrder.source || null,
        inter_company_order_reference: salesOrder.inter_company_order_reference || null,
        campaign: salesOrder.campaign || null,
        party_account_currency: salesOrder.party_account_currency || null,
        total_amount: salesOrder.total_amount ? parseFloat(salesOrder.total_amount) : null,
        expected_payment_date: salesOrder.expected_payment_date ? new Date(salesOrder.expected_payment_date) : null,
        paid_amount: salesOrder.paid_amount ? parseFloat(salesOrder.paid_amount) : null,
        balance: salesOrder.balance ? parseFloat(salesOrder.balance) : null,
        payment_terms_template: salesOrder.payment_terms_template || null,
        tc_name: salesOrder.tc_name || null,
        terms: salesOrder.terms || null,
        haravan_order_id: salesOrder.haravan_order_id || null,
        haravan_ref_order_id: salesOrder.haravan_ref_order_id || null,
        haravan_created_at: salesOrder.haravan_created_at ? new Date(salesOrder.haravan_created_at) : null,
        source_name: salesOrder.source_name || null,
      };

      // Use Prisma ORM to upsert sales order
      const result = await this.db.sales_orders.upsert({
        where: {
          name: salesOrderData.name
        },
        update: {
          owner: salesOrderData.owner || null,
          creation: salesOrderData.creation || null,
          modified: salesOrderData.modified || null,
          modified_by: salesOrderData.modified_by || null,
          docstatus: salesOrderData.docstatus || 0,
          idx: salesOrderData.idx || null,
          title: salesOrderData.title || null,
          naming_series: salesOrderData.naming_series || null,
          tax_id: salesOrderData.tax_id || null,
          order_type: salesOrderData.order_type || null,
          skip_delivery_note: salesOrderData.skip_delivery_note || 0,
          delivery_date: salesOrderData.delivery_date || null,
          po_no: salesOrderData.po_no || null,
          po_date: salesOrderData.po_date || null,
          company: salesOrderData.company || null,
          amended_from: salesOrderData.amended_from || null,
          customer_name: salesOrderData.customer_name || null,
          order_number: salesOrderData.order_number || null,
          transaction_date: salesOrderData.transaction_date || null,
          real_order_date: salesOrderData.real_order_date || null,
          cancelled_status: salesOrderData.cancelled_status || null,
          financial_status: salesOrderData.financial_status || null,
          fulfillment_status: salesOrderData.fulfillment_status || null,
          cost_center: salesOrderData.cost_center || null,
          project: salesOrderData.project || null,
          currency: salesOrderData.currency || 'VND',
          conversion_rate: salesOrderData.conversion_rate ? parseFloat(salesOrderData.conversion_rate) : null,
          selling_price_list: salesOrderData.selling_price_list || null,
          price_list_currency: salesOrderData.price_list_currency || null,
          plc_conversion_rate: salesOrderData.plc_conversion_rate ? parseFloat(salesOrderData.plc_conversion_rate) : null,
          ignore_pricing_rule: salesOrderData.ignore_pricing_rule || 0,
          scan_barcode: salesOrderData.scan_barcode || null,
          set_warehouse: salesOrderData.set_warehouse || null,
          reserve_stock: salesOrderData.reserve_stock || 0,
          apply_discount_on: salesOrderData.apply_discount_on || null,
          base_discount_amount: salesOrderData.base_discount_amount ? parseFloat(salesOrderData.base_discount_amount) : null,
          coupon_code: salesOrderData.coupon_code || null,
          additional_discount_percentage: salesOrderData.additional_discount_percentage ? parseFloat(salesOrderData.additional_discount_percentage) : null,
          total_qty: salesOrderData.total_qty ? parseFloat(salesOrderData.total_qty) : null,
          total: salesOrderData.total ? parseFloat(salesOrderData.total) : null,
          discount_amount: salesOrderData.discount_amount ? parseFloat(salesOrderData.discount_amount) : null,
          grand_total: salesOrderData.grand_total ? parseFloat(salesOrderData.grand_total) : null,
          base_total: salesOrderData.base_total ? parseFloat(salesOrderData.base_total) : null,
          base_net_total: salesOrderData.base_net_total ? parseFloat(salesOrderData.base_net_total) : null,
          total_net_weight: salesOrderData.total_net_weight ? parseFloat(salesOrderData.total_net_weight) : null,
          net_total: salesOrderData.net_total ? parseFloat(salesOrderData.net_total) : null,
          tax_category: salesOrderData.tax_category || null,
          taxes_and_charges: salesOrderData.taxes_and_charges || null,
          shipping_rule: salesOrderData.shipping_rule || null,
          incoterm: salesOrderData.incoterm || null,
          named_place: salesOrderData.named_place || null,
          base_total_taxes_and_charges: salesOrderData.base_total_taxes_and_charges ? parseFloat(salesOrderData.base_total_taxes_and_charges) : null,
          total_taxes_and_charges: salesOrderData.total_taxes_and_charges ? parseFloat(salesOrderData.total_taxes_and_charges) : null,
          base_grand_total: salesOrderData.base_grand_total ? parseFloat(salesOrderData.base_grand_total) : null,
          base_rounding_adjustment: salesOrderData.base_rounding_adjustment ? parseFloat(salesOrderData.base_rounding_adjustment) : null,
          base_rounded_total: salesOrderData.base_rounded_total ? parseFloat(salesOrderData.base_rounded_total) : null,
          base_in_words: salesOrderData.base_in_words || null,
          rounding_adjustment: salesOrderData.rounding_adjustment ? parseFloat(salesOrderData.rounding_adjustment) : null,
          rounded_total: salesOrderData.rounded_total ? parseFloat(salesOrderData.rounded_total) : null,
          in_words: salesOrderData.in_words || null,
          advance_paid: salesOrderData.advance_paid ? parseFloat(salesOrderData.advance_paid) : null,
          disable_rounded_total: salesOrderData.disable_rounded_total || 0,
          other_charges_calculation: salesOrderData.other_charges_calculation || null,
          contact_person: salesOrderData.contact_person || null,
          contact_display: salesOrderData.contact_display || null,
          contact_phone: salesOrderData.contact_phone || null,
          contact_mobile: salesOrderData.contact_mobile || null,
          contact_email: salesOrderData.contact_email || null,
          customer_address: salesOrderData.customer_address || null,
          address_display: salesOrderData.address_display || null,
          customer_group: salesOrderData.customer_group || null,
          territory: salesOrderData.territory || null,
          shipping_address_name: salesOrderData.shipping_address_name || null,
          shipping_address: salesOrderData.shipping_address || null,
          customer: salesOrderData.customer || null,
          gender: salesOrderData.gender || null,
          customer_personal_id: salesOrderData.customer_personal_id || null,
          birth_date: salesOrderData.birth_date ? new Date(salesOrderData.birth_date) : null,
          date_of_issuance: salesOrderData.date_of_issuance ? new Date(salesOrderData.date_of_issuance) : null,
          dispatch_address: salesOrderData.dispatch_address || null,
          place_of_issuance: salesOrderData.place_of_issuance || null,
          dispatch_address_name: salesOrderData.dispatch_address_name || null,
          company_address: salesOrderData.company_address || null,
          company_address_display: salesOrderData.company_address_display || null,
          company_contact_person: salesOrderData.company_contact_person || null,
          status: salesOrderData.status || null,
          delivery_status: salesOrderData.delivery_status || null,
          per_delivered: salesOrderData.per_delivered ? parseFloat(salesOrderData.per_delivered) : null,
          per_billed: salesOrderData.per_billed ? parseFloat(salesOrderData.per_billed) : null,
          per_picked: salesOrderData.per_picked ? parseFloat(salesOrderData.per_picked) : null,
          billing_status: salesOrderData.billing_status || null,
          sales_partner: salesOrderData.sales_partner || null,
          amount_eligible_for_commission: salesOrderData.amount_eligible_for_commission ? parseFloat(salesOrderData.amount_eligible_for_commission) : null,
          commission_rate: salesOrderData.commission_rate ? parseFloat(salesOrderData.commission_rate) : null,
          total_commission: salesOrderData.total_commission ? parseFloat(salesOrderData.total_commission) : null,
          loyalty_points: salesOrderData.loyalty_points ? parseFloat(salesOrderData.loyalty_points) : null,
          loyalty_amount: salesOrderData.loyalty_amount ? parseFloat(salesOrderData.loyalty_amount) : null,
          from_date: salesOrderData.from_date ? new Date(salesOrderData.from_date) : null,
          to_date: salesOrderData.to_date ? new Date(salesOrderData.to_date) : null,
          auto_repeat: salesOrderData.auto_repeat || null,
          letter_head: salesOrderData.letter_head || null,
          group_same_items: salesOrderData.group_same_items || 0,
          select_print_heading: salesOrderData.select_print_heading || null,
          language: salesOrderData.language || null,
          is_internal_customer: salesOrderData.is_internal_customer || 0,
          represents_company: salesOrderData.represents_company || null,
          source: salesOrderData.source || null,
          inter_company_order_reference: salesOrderData.inter_company_order_reference || null,
          campaign: salesOrderData.campaign || null,
          party_account_currency: salesOrderData.party_account_currency || null,
          total_amount: salesOrderData.total_amount ? parseFloat(salesOrderData.total_amount) : null,
          expected_payment_date: salesOrderData.expected_payment_date ? new Date(salesOrderData.expected_payment_date) : null,
          paid_amount: salesOrderData.paid_amount ? parseFloat(salesOrderData.paid_amount) : null,
          balance: salesOrderData.balance ? parseFloat(salesOrderData.balance) : null,
          payment_terms_template: salesOrderData.payment_terms_template || null,
          tc_name: salesOrderData.tc_name || null,
          terms: salesOrderData.terms || null,
          haravan_order_id: salesOrderData.haravan_order_id || null,
          haravan_ref_order_id: salesOrderData.haravan_ref_order_id || null,
          haravan_created_at: salesOrderData.haravan_created_at ? new Date(salesOrderData.haravan_created_at) : null,
          source_name: salesOrderData.source_name || null,
        },
        create: salesOrderData
      });

      console.log(` ✅ Successfully`);
      return result;
      
    } catch (error) {
      console.error(` ❌ Error saving Sales Order ${salesOrder.name} to database:`, error);
      throw error;
    }
  }

  async saveSalesOrderItemsToDatabase(salesOrderName, items) {
    try {
      if (!items || items.length === 0) return;

      // Upsert each item individually using name as unique identifier
      const upsertPromises = items.map(item => {
        const itemData = {
          name: item.name,
          owner: item.owner,
          creation: item.creation ? new Date(item.creation) : null,
          modified: item.modified ? new Date(item.modified) : null,
          modified_by: item.modified_by,
          docstatus: item.docstatus || 0,
          idx: item.idx,
          item_name: item.item_name,
          variant_title: item.variant_title,
          sku: item.item_code, // Map item_code to sku field
          barcode: item.barcode,
          haravan_variant_id: item.haravan_variant_id ? BigInt(item.haravan_variant_id) : null,
          ensure_delivery_based_on_produced_serial_no: item.ensure_delivery_based_on_produced_serial_no || 0,
          is_stock_item: item.is_stock_item || 0,
          reserve_stock: item.reserve_stock || 0,
          qty: item.qty ? parseFloat(item.qty) : null,
          stock_uom: item.stock_uom,
          uom: item.uom,
          conversion_factor: item.conversion_factor ? parseFloat(item.conversion_factor) : null,
          stock_qty: item.stock_qty ? parseFloat(item.stock_qty) : null,
          stock_reserved_qty: item.stock_reserved_qty ? parseFloat(item.stock_reserved_qty) : null,
          price_list_rate: item.price_list_rate ? parseFloat(item.price_list_rate) : null,
          base_price_list_rate: item.base_price_list_rate ? parseFloat(item.base_price_list_rate) : null,
          discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : null,
          discount_amount: item.discount_amount ? parseFloat(item.discount_amount) : null,
          distributed_discount_amount: item.distributed_discount_amount ? parseFloat(item.distributed_discount_amount) : null,
          base_rate_with_margin: item.base_rate_with_margin ? parseFloat(item.base_rate_with_margin) : null,
          margin_type: item.margin_type,
          margin_rate_or_amount: item.margin_rate_or_amount ? parseFloat(item.margin_rate_or_amount) : null,
          rate_with_margin: item.rate_with_margin ? parseFloat(item.rate_with_margin) : null,
          rate: item.rate ? parseFloat(item.rate) : null,
          amount: item.amount ? parseFloat(item.amount) : null,
          base_rate: item.base_rate ? parseFloat(item.base_rate) : null,
          base_amount: item.base_amount ? parseFloat(item.base_amount) : null,
          stock_uom_rate: item.stock_uom_rate ? parseFloat(item.stock_uom_rate) : null,
          is_free_item: item.is_free_item || 0,
          grant_commission: item.grant_commission || 0,
          net_rate: item.net_rate ? parseFloat(item.net_rate) : null,
          net_amount: item.net_amount ? parseFloat(item.net_amount) : null,
          base_net_rate: item.base_net_rate ? parseFloat(item.base_net_rate) : null,
          base_net_amount: item.base_net_amount ? parseFloat(item.base_net_amount) : null,
          billed_amt: item.billed_amt ? parseFloat(item.billed_amt) : null,
          valuation_rate: item.valuation_rate ? parseFloat(item.valuation_rate) : null,
          gross_profit: item.gross_profit ? parseFloat(item.gross_profit) : null,
          delivered_by_supplier: item.delivered_by_supplier || 0,
          weight_per_unit: item.weight_per_unit ? parseFloat(item.weight_per_unit) : null,
          total_weight: item.total_weight ? parseFloat(item.total_weight) : null,
          against_blanket_order: item.against_blanket_order || 0,
          blanket_order_rate: item.blanket_order_rate ? parseFloat(item.blanket_order_rate) : null,
          actual_qty: item.actual_qty ? parseFloat(item.actual_qty) : null,
          company_total_stock: item.company_total_stock ? parseFloat(item.company_total_stock) : null,
          projected_qty: item.projected_qty ? parseFloat(item.projected_qty) : null,
          ordered_qty: item.ordered_qty ? parseFloat(item.ordered_qty) : null,
          planned_qty: item.planned_qty ? parseFloat(item.planned_qty) : null,
          production_plan_qty: item.production_plan_qty ? parseFloat(item.production_plan_qty) : null,
          work_order_qty: item.work_order_qty ? parseFloat(item.work_order_qty) : null,
          delivered_qty: item.delivered_qty ? parseFloat(item.delivered_qty) : null,
          produced_qty: item.produced_qty ? parseFloat(item.produced_qty) : null,
          returned_qty: item.returned_qty ? parseFloat(item.returned_qty) : null,
          picked_qty: item.picked_qty ? parseFloat(item.picked_qty) : null,
          page_break: item.page_break || 0,
          item_tax_rate: item.item_tax_rate,
          transaction_date: item.transaction_date ? new Date(item.transaction_date) : null,
          cost_center: item.cost_center,
          parent: salesOrderName,
          parentfield: item.parentfield || 'items',
          parenttype: item.parenttype || 'Sales Order',
          doctype: item.doctype || 'Sales Order Item',
        };

        return this.db.sales_order_items.upsert({
          where: {
            name: item.name
          },
          update: {
            owner: itemData.owner,
            creation: itemData.creation,
            modified: itemData.modified,
            modified_by: itemData.modified_by,
            docstatus: itemData.docstatus,
            idx: itemData.idx,
            item_name: itemData.item_name,
            variant_title: itemData.variant_title,
            sku: itemData.sku,
            barcode: itemData.barcode,
            haravan_variant_id: itemData.haravan_variant_id,
            ensure_delivery_based_on_produced_serial_no: itemData.ensure_delivery_based_on_produced_serial_no,
            is_stock_item: itemData.is_stock_item,
            reserve_stock: itemData.reserve_stock,
            qty: itemData.qty,
            stock_uom: itemData.stock_uom,
            uom: itemData.uom,
            conversion_factor: itemData.conversion_factor,
            stock_qty: itemData.stock_qty,
            stock_reserved_qty: itemData.stock_reserved_qty,
            price_list_rate: itemData.price_list_rate,
            base_price_list_rate: itemData.base_price_list_rate,
            discount_percentage: itemData.discount_percentage,
            discount_amount: itemData.discount_amount,
            distributed_discount_amount: itemData.distributed_discount_amount,
            base_rate_with_margin: itemData.base_rate_with_margin,
            margin_type: itemData.margin_type,
            margin_rate_or_amount: itemData.margin_rate_or_amount,
            rate_with_margin: itemData.rate_with_margin,
            rate: itemData.rate,
            amount: itemData.amount,
            base_rate: itemData.base_rate,
            base_amount: itemData.base_amount,
            stock_uom_rate: itemData.stock_uom_rate,
            is_free_item: itemData.is_free_item,
            grant_commission: itemData.grant_commission,
            net_rate: itemData.net_rate,
            net_amount: itemData.net_amount,
            base_net_rate: itemData.base_net_rate,
            base_net_amount: itemData.base_net_amount,
            billed_amt: itemData.billed_amt,
            valuation_rate: itemData.valuation_rate,
            gross_profit: itemData.gross_profit,
            delivered_by_supplier: itemData.delivered_by_supplier,
            weight_per_unit: itemData.weight_per_unit,
            total_weight: itemData.total_weight,
            against_blanket_order: itemData.against_blanket_order,
            blanket_order_rate: itemData.blanket_order_rate,
            actual_qty: itemData.actual_qty,
            company_total_stock: itemData.company_total_stock,
            projected_qty: itemData.projected_qty,
            ordered_qty: itemData.ordered_qty,
            planned_qty: itemData.planned_qty,
            production_plan_qty: itemData.production_plan_qty,
            work_order_qty: itemData.work_order_qty,
            delivered_qty: itemData.delivered_qty,
            produced_qty: itemData.produced_qty,
            returned_qty: itemData.returned_qty,
            picked_qty: itemData.picked_qty,
            page_break: itemData.page_break,
            item_tax_rate: itemData.item_tax_rate,
            transaction_date: itemData.transaction_date,
            cost_center: itemData.cost_center,
            parent: itemData.parent,
            parentfield: itemData.parentfield,
            parenttype: itemData.parenttype,
            doctype: itemData.doctype,
          },
          create: itemData
        });
      });

      // Execute all upserts in parallel
      await Promise.all(upsertPromises);

      console.log(`  ${items.length} Sales Order Items for ${salesOrderName} upserted successfully`);
      
    } catch (error) {
      console.error(`  Error upserting Sales Order Items for ${salesOrderName}:`, error);
      throw error;
    }
  }

  // 4. Main functions
  async syncSalesOrders(options = {}) {
    try {
      // Default options
      const {
        minutesBack = 1440, // Default: 24 hours = 1440 minutes
        syncType = 'auto' // 'auto', 'manual', 'frequent'
      } = options;

      // Calculate time range
      const fromDate = dayjs().utc().subtract(minutesBack, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      const toDate = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
      
      // Human readable time range
      let timeRange;
      if (minutesBack < 60) {
        timeRange = `${minutesBack} minutes`;
      } else if (minutesBack < 1440) {
        const hours = Math.round(minutesBack / 60 * 10) / 10; // 1 decimal
        timeRange = `${hours} hours`;
      } else {
        const days = Math.round(minutesBack / 1440 * 10) / 10; // 1 decimal  
        timeRange = `${days} days`;
      }
      
      console.log(`🔄 Starting ${syncType} Sales Order sync for ${timeRange}...`);
      console.log(`📅 Syncing Sales Orders from ${fromDate} to ${toDate}`);

      // Get Sales Orders Records 
      const salesOrders = await this.fetchSalesOrdersFromERP(fromDate, toDate);
      
      if (salesOrders.length === 0) {
        console.log("📦 No Sales Orders to sync");
        return { 
          success: true, 
          synced: 0, 
          message: `No Sales Orders to sync (${timeRange})`,
          timeRange,
          minutesBack
        };
      }

      let syncedCount = 0;
      let errorCount = 0;

      // Loop through Sales Orders
      for (const salesOrder of salesOrders) {
        try {
          // Save Sales Order
          await this.saveSalesOrderToDatabase(salesOrder);
          
          // Get Sales Order Details and save items
          const salesOrderDetails = await this.fetchSalesOrderDetails(salesOrder.name);
          if (salesOrderDetails && salesOrderDetails.items) {
            await this.saveSalesOrderItemsToDatabase(salesOrder.name, salesOrderDetails.items);
          }
          
          syncedCount++;
          console.log(`✅ Synced Sales Order: ${salesOrder.name}`);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to sync Sales Order ${salesOrder.name}:`, error);
        }
      }

      const result = {
        success: true,
        total: salesOrders.length,
        synced: syncedCount,
        errors: errorCount,
        timeRange,
        minutesBack,
        syncType,
        message: `${syncType}: ${syncedCount}/${salesOrders.length} Sales Orders (${timeRange})`
      };

      console.log("🎉 Sales Order sync completed:", result);
      return result;

    } catch (error) {
      console.error(" ❌ Sales Order sync failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Sales Order sync failed"
      };
    }
  }

  // Static methods with minutes parameter
  static async syncDailySalesOrders(env) {
    const syncService = new SalesOrderSyncService(env);
    return await syncService.syncSalesOrders({ 
      minutesBack: 1000, // default 10 mitues ago
      syncType: 'auto' 
    });
  }

  // Static method to sync Sales Orders with custom range
  static async syncSalesOrdersCustomRange(env, options = {}) {
    const syncService = new SalesOrderSyncService(env);
    const {
      minutesBack = 1440, // Default: 1 day = 1440 minutes
      syncType = 'manual'
    } = options;
    
    return await syncService.syncSalesOrders({ 
      minutesBack,
      syncType 
    });
  }
} 