import { properties } from "@/data/properties";
import type { PropertyRepository } from "./repository";
import { queryProperties } from "./query";

/** In-memory implementation backed by src/data/properties.ts. */
export const mockPropertyRepository: PropertyRepository = {
  async list(query = {}) {
    return queryProperties(properties, query);
  },
  async getBySlug(slug) {
    return properties.find((property) => property.slug === slug) ?? null;
  },
  async listSlugs() {
    return properties.map((property) => property.slug);
  },
  async listFeatured(limit = 3) {
    return properties.filter((property) => property.featured).slice(0, limit);
  },
};
