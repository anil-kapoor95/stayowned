import type { PaginatedResult, Property, PropertyQuery } from "@/types/property";
import { mockPropertyRepository } from "./mock-repository";

/**
 * Data-access contract used by pages. It is vendor-neutral and async so an
 * API-backed implementation (REST, GraphQL, CMS…) can replace the mock one
 * without touching UI components:
 *
 *   export const propertyRepository: PropertyRepository = createApiPropertyRepository(...)
 */
export interface PropertyRepository {
  list(query?: PropertyQuery): Promise<PaginatedResult<Property>>;
  getBySlug(slug: string): Promise<Property | null>;
  listSlugs(): Promise<string[]>;
  listFeatured(limit?: number): Promise<Property[]>;
}

export const propertyRepository: PropertyRepository = mockPropertyRepository;
