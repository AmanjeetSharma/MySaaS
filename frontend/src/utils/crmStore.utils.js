export const DEFAULT_PAGINATION = Object.freeze({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
});

export const DEFAULT_DEAL_STATISTICS = Object.freeze({
    active: 0,
    won: 0,
    lost: 0,
    total: 0,
});

export const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || null;
};

export const isSameEntity = (left, right) => {
    const leftId = getEntityId(left);
    const rightId = getEntityId(right);

    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};

export const mergeEntityById = (items, entity, { prepend = true } = {}) => {
    const entityId = getEntityId(entity);

    if (!entityId) return items;

    const exists = items.some(item => isSameEntity(item, entity));

    if (!exists) {
        return prepend ? [entity, ...items] : [...items, entity];
    }

    return items.map(item =>
        isSameEntity(item, entity)
            ? { ...item, ...entity }
            : item
    );
};

export const removeEntityById = (items, entityOrId) => {
    const entityId = getEntityId(entityOrId);

    if (!entityId) return items;

    return items.filter(item => getEntityId(item) !== entityId);
};

export const normalizePagination = (pagination, fallback = DEFAULT_PAGINATION) => ({
    ...fallback,
    ...(pagination || {}),
});

export const unwrapApiData = (response) => response?.data?.data;

export const getApiMessage = (response, fallback) =>
    response?.data?.message ||
    response?.data?.data?.message ||
    fallback;

export const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

export const compactObject = (value = {}) =>
    Object.fromEntries(
        Object.entries(value).filter(([, item]) =>
            item !== undefined &&
            item !== null &&
            item !== ''
        )
    );
