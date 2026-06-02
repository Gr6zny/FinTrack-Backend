import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::account.account', ({ strapi }) => ({

  async find(ctx) {
    const { user } = ctx.state;
    const sanitizedQuery: any = await this.sanitizeQuery(ctx);
    sanitizedQuery.filters = {
      ...(sanitizedQuery.filters || {}),
      users_permissions_user: { id: { $eq: user.id } },
    };
    const { results, pagination } = await strapi
      .service('api::account.account')
      .find(sanitizedQuery);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults, { pagination });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::account.account', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    return super.findOne(ctx);
  },

  async create(ctx) {
    const { user } = ctx.state;
    const { data } = ctx.request.body;
    const result = await strapi.entityService.create('api::account.account', {
      data: {
        ...data,
        users_permissions_user: user.id,
        publishedAt: new Date(),
      },
    });
    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::account.account', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    const { data } = ctx.request.body;
    const result = await strapi.entityService.update('api::account.account', id, {
      data,
    });
    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity: any = await strapi.entityService.findOne('api::account.account', id, {
      populate: { users_permissions_user: { fields: ['id'] } },
    });
    if (!entity || entity.users_permissions_user?.id !== user.id) return ctx.notFound();
    return super.delete(ctx);
  },
}));
