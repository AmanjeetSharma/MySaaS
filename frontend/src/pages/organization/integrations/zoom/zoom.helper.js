/**
 * Extract entity ID safely from either string or populated object
 */
export const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

/**
 * Format connected timestamp with date and time
 */
export const formatConnectedDate = (dateString) => {
  if (!dateString) return 'Active';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Active';

    const formattedDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${formattedDate} at ${formattedTime}`;
  } catch {
    return 'Active';
  }
};

/**
 * Parse OAuth callback parameters from search query
 */
export const parseZoomCallbackParams = (searchParams) => {
  const connected = searchParams.get('connected');
  const email = searchParams.get('email');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    let message = 'Failed to connect Zoom account.';
    if (errorParam === 'oauth_failed') {
      message = 'Zoom authorization failed or was rejected.';
    } else if (errorParam === 'access_denied') {
      message = 'Zoom authorization was cancelled.';
    } else {
      message = `Zoom connection error: ${errorParam}`;
    }
    return { isSuccess: false, isError: true, message, email: null };
  }

  if (connected === 'true') {
    return {
      isSuccess: true,
      isError: false,
      message: 'Zoom connected successfully.',
      email: email ? decodeURIComponent(email) : null
    };
  }

  return { isSuccess: false, isError: false, message: null, email: null };
};
