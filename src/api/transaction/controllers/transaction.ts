import { factories } from '@strapi/strapi';

async function updateBalance(accountId: number, delta: number) {
  if (!accountId || delta === 0) return;
  const account = await strapi.db.query('api::account.account').findOne({ where: { id: accountId } });
  if (account) {
    await strapi.db.query('api::account.account').update({
      where: { id: accountId },
      data: { balance: account.balance + delta },
    });
  }
}

async function applyTransaction(amount: number, type: string, accountFrom: number, accountTo?: number) {
  if (type === 'expense') await updateBalance(accountFrom, -amount);
  else if (type === 'income') await updateBalance(accountFrom, amount);
  else if (type === 'transfer') {
    await updateBalance(accountFrom, -amount);
    if (accountTo) await updateBalance(accountTo, amount);
  }
}

export default factories.createCoreController('api::transaction.transaction', ({ strapi }) => ({

  async find(ctx) {
    const { user } = ctx.state;
    const sanitizedQuery: any = await this.sanitizeQuery(ctx);
    sanitizedQuery.filters = {
      ...(sanitizedQuery.filters || {}),
      users_permissions_user: { id: { $eq: user.id } },
    };
    const { results, pagination } = await strapi
      .service('api::transaction.transaction')
      .find(sanitizedQuery);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults, { pagination });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::transaction.transaction', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    return super.findOne(ctx);
  },

  async create(ctx) {
    const { user } = ctx.state;
    const { data } = ctx.request.body;
    const result = await strapi.entityService.create('api::transaction.transaction', {
      data: {
        ...data,
        users_permissions_user: user.id,
        publishedAt: new Date(),
      },
    });
    await applyTransaction(data.amount, data.type, data.account_from, data.account_to);
    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::transaction.transaction', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    const { data } = ctx.request.body;
    const result = await strapi.entityService.update('api::transaction.transaction', id, {
      data,
    });
    const oldAmount = entity.amount;
    const oldType = entity.type;
    const oldAccountFrom = entity.account_from?.id || entity.account_from;
    const oldAccountTo = entity.account_to?.id || entity.account_to;
    await applyTransaction(-oldAmount, oldType, oldAccountFrom, oldAccountTo);
    await applyTransaction(data.amount, data.type, data.account_from, data.account_to);
    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::transaction.transaction', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    const amount = entity.amount;
    const type = entity.type;
    const accountFrom = entity.account_from?.id || entity.account_from;
    const accountTo = entity.account_to?.id || entity.account_to;
    await applyTransaction(-amount, type, accountFrom, accountTo);
    return super.delete(ctx);
  },
}));
