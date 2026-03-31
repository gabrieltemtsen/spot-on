import { mutation } from "./_generated/server";

export const launchCleanup = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete all orders and clean up receipts
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      if (order.receiptStorageId) {
        try {
          await ctx.storage.delete(order.receiptStorageId);
        } catch (e) {
          // ignore error if already deleted
        }
      }
      await ctx.db.delete(order._id);
    }

    // 2. Delete all expenses
    const expenses = await ctx.db.query("expenses").collect();
    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }

    // 3. Delete all customers
    const customers = await ctx.db.query("customers").collect();
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }

    // 4. Migrate Team Members' PIN to 6 digits by appending "00"
    const members = await ctx.db.query("teamMembers").collect();
    for (const member of members) {
      if (member.pin.length === 4) {
        await ctx.db.patch(member._id, { pin: member.pin + "00" });
      }
    }

    return { 
      cleaned: true, 
      details: {
        ordersDeleted: orders.length,
        expensesDeleted: expenses.length,
        customersDeleted: customers.length,
        membersMigrated: members.filter(m => m.pin.length === 4).length
      }
    };
  },
});
