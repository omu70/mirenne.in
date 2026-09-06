import type { Review } from "@/lib/types";

/**
 * Empty on purpose. This file previously held eighteen invented reviews from
 * invented customers, written against the old placeholder catalogue. When the
 * Collection 1 pieces took over the p01–p06 ids, four of those reviews silently
 * reattached themselves to Ivory Grace — fabricated five-star testimonials, in
 * fabricated names, describing a raw silk gown with sleeves, sitting on a real
 * product page.
 *
 * Reviews have to come from real customers. Until there are some, every
 * product page shows "This piece hasn't been reviewed yet." Add entries here
 * (or wire this to a real reviews service) once there is genuine feedback to
 * publish.
 */
export const reviews: Review[] = [];
