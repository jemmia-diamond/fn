import FrappeClient from "frappe/frappe-client";

const frappeClient = new FrappeClient({
  url: process.env.JEMMIA_ERP_BASE_URL,
  apiKey: process.env.JEMMIA_ERP_API_KEY,
  apiSecret: process.env.JEMMIA_ERP_API_SECRET
});

const main = async () => {
  const salesOrders = await frappeClient.getList("Sales Order", {
    fields: ["name", "customer", "primary_sales_person"]
  });

  console.warn(`Tổng số Sales Order: ${salesOrders.length}`);

  for (const order of salesOrders) {
    console.warn(`\n--- Đang xử lý Sales Order: ${order.name} ---`);

    try {
      const fullOrder = await frappeClient.getDoc("Sales Order", order.name);

      console.warn(`Customer: ${fullOrder.customer}`);
      console.warn(`Primary Sales Person: ${fullOrder.primary_sales_person}`);
      console.warn(`Grand Total: ${fullOrder.grand_total}`);

      if (fullOrder.sales_team && fullOrder.sales_team.length > 0) {
        console.warn(`Sales Team có ${fullOrder.sales_team.length} thành viên (TRƯỚC khi tính toán):`);

        // Log original data
        fullOrder.sales_team.forEach((member, index) => {
          console.warn(`  ${index + 1}. Sales Person: ${member.sales_person}`);
          console.warn(`     Original Allocated %: ${member.allocated_percentage || 0}%`);
          console.warn(`     Original Allocated Amount: ${member.allocated_amount || 0}`);
          console.warn(`     Commission Rate: ${member.commission_rate || 0}%`);
        });

        // Calculate contributions
        console.warn("\n--- Tính toán lại contribution ---");
        const updatedOrder = await calculateContribution(fullOrder);

        console.warn("Sales Team SAU khi tính toán:");
        updatedOrder.sales_team.forEach((member, index) => {
          console.warn(`  ${index + 1}. Sales Person: ${member.sales_person}`);
          console.warn(`     Calculated Allocated %: ${member.allocated_percentage}%`);
          console.warn(`     Calculated Allocated Amount: ${member.allocated_amount}`);
          console.warn(`     Calculated Incentives: ${member.incentives || 0}`);
        });

        // Show secondary members
        const secondaryMembers = updatedOrder.sales_team
          .filter(member => member.sales_person !== updatedOrder.primary_sales_person);

        if (secondaryMembers.length > 0) {
          console.warn(`Secondary Sales Persons: ${secondaryMembers.map(m => m.sales_person).join(", ")}`);
        }

        // Update sales team in ERPNext
        await frappeClient.bulkUpdate(updatedOrder.sales_team);
        console.warn("Sales Team đã được cập nhật thành công trong ERPNext.");
      } else {
        console.warn("Sales Team: Không có dữ liệu");
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý Sales Order ${order.name}:`, error.message);
    }
  }
};

void main();

// Helper functions - JavaScript equivalents of Frappe Python methods
const flt = (value, precision = 2) => {
  const num = parseFloat(value) || 0;
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
};

const throwError = (message) => {
  throw new Error(message);
};

// Converted from Python: validate_sales_team function
const validateSalesTeam = async (salesTeam) => {
  const salesPersons = salesTeam.map(d => d.sales_person).filter(Boolean);

  if (!salesPersons.length) {
    return;
  }

  try {
    // Get sales person status from ERPNext
    const salesPersonStatus = await frappeClient.getList("Sales Person", {
      filters: [["name", "in", salesPersons]],
      fields: ["name", "enabled"]
    });

    for (const row of salesPersonStatus) {
      if (!row.enabled) {
        throwError(`Sales Person <b>${row.name}</b> is disabled.`);
      }
    }
  } catch (error) {
    console.error("Error validating sales team:", error.message);
    throw error;
  }
};

// Converted from Python: calculate_contribution function
const calculateContribution = async (salesOrder) => {
  if (!salesOrder.sales_team || !salesOrder.sales_team.length) {
    return salesOrder;
  }

  let total = 0.0;
  const salesTeam = salesOrder.sales_team;

  // Validate sales team first
  await validateSalesTeam(salesTeam);

  // Process each sales person
  for (const salesPerson of salesTeam) {
    let allocatedPercentage = 0.0;

    // Calculate allocated percentage
    if (salesPerson.numerator && salesPerson.denominator) {
      allocatedPercentage = flt(salesPerson.numerator / salesPerson.denominator * 100.0, 2);
    } else {
      allocatedPercentage = flt(salesPerson.allocated_percentage, 2);
    }

    // Calculate allocated amount
    const amountEligibleForCommission = flt(salesOrder.amount_eligible_for_commission || salesOrder.grand_total || 0);
    salesPerson.allocated_amount = flt(
      amountEligibleForCommission * allocatedPercentage / 100.0,
      2
    );

    // Calculate incentives if commission rate exists
    if (salesPerson.commission_rate) {
      salesPerson.incentives = flt(
        salesPerson.allocated_amount * flt(salesPerson.commission_rate) / 100.0,
        2
      );
    }

    // Update allocated percentage
    salesPerson.allocated_percentage = allocatedPercentage;
    total += allocatedPercentage;
  }

  // Validate total percentage
  if (salesTeam.length && Math.round(total) !== 100.0) {
    throwError("Total allocated percentage for sales team should be 100");
  }

  return salesOrder;
};
