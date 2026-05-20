import slugify from "slugify";
import { nanoid } from "nanoid";
import { findIfSlugExists } from "./service.repository.js";

export const generateServiceSlug = async (serviceName, orgId) => {
    const baseSlug = slugify(serviceName, { lower: true, strict: true, trim: true });
    let serviceSlug = baseSlug;
    const slugExists = await findIfSlugExists(orgId, serviceSlug);

    if (slugExists) {
        const uniqueSuffix = nanoid(4).toLowerCase();
        serviceSlug = `${baseSlug}-${uniqueSuffix}`;
    }
    return serviceSlug;
}



