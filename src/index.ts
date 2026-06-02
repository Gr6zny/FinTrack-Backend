// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    const defaultCategories = [
      { name: "Продукты", type: "expense", icon: "fa-utensils", color: "#e63946", is_system: true },
      { name: "Транспорт", type: "expense", icon: "fa-bus", color: "#f4a261", is_system: true },
      { name: "Жильё", type: "expense", icon: "fa-home", color: "#2a9d8f", is_system: true },
      { name: "Здоровье", type: "expense", icon: "fa-heartbeat", color: "#e76f51", is_system: true },
      { name: "Развлечения", type: "expense", icon: "fa-film", color: "#9b5de5", is_system: true },
      { name: "Одежда", type: "expense", icon: "fa-tshirt", color: "#f15bb5", is_system: true },
      { name: "Связь", type: "expense", icon: "fa-phone", color: "#00bbf9", is_system: true },
      { name: "Образование", type: "expense", icon: "fa-book", color: "#00f5d4", is_system: true },
      { name: "Кафе и рестораны", type: "expense", icon: "fa-coffee", color: "#d62828", is_system: true },
      { name: "Подарки", type: "expense", icon: "fa-gift", color: "#ff006e", is_system: true },
      { name: "Зарплата", type: "income", icon: "fa-money-bill-wave", color: "#28a745", is_system: true },
      { name: "Фриланс", type: "income", icon: "fa-laptop", color: "#4361ee", is_system: true },
      { name: "Инвестиции", type: "income", icon: "fa-chart-line", color: "#3a0ca3", is_system: true },
      { name: "Кешбэк", type: "income", icon: "fa-percent", color: "#4cc9f0", is_system: true },
    ];

    for (const cat of defaultCategories) {
      const exists = await strapi.db.query("api::category.category").findOne({
        where: { name: cat.name, type: cat.type },
      });
      if (!exists) {
        await strapi.db.query("api::category.category").create({
          data: { ...cat, publishedAt: new Date() },
        });
      }
    }
  },
};
