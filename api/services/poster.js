/**
 * Auto-posting service for LocalBoost AI (CommonJS - Vercel).
 * Stub implementations — logs posting actions.
 */

/**
 * Post content to Google Business Profile.
 * @param {Object} contentItem - { id, title, body, type }
 * @returns {boolean} success
 */
async function postToGoogleBusiness(contentItem) {
  console.log(`[POSTER] Would post to GBP: "${contentItem.title}"`);
  console.log(`[POSTER] Body preview: ${contentItem.body.substring(0, 80)}...`);
  // TODO: Implement actual GBP API integration
  return true;
}

/**
 * Post content to Facebook.
 * @param {Object} contentItem - { id, title, body, type }
 * @returns {boolean} success
 */
async function postToFacebook(contentItem) {
  console.log(`[POSTER] Would post to Facebook: "${contentItem.title}"`);
  // TODO: Implement actual Facebook Graph API integration
  return true;
}

/**
 * Post content to Instagram.
 * @param {Object} contentItem - { id, title, body, type }
 * @returns {boolean} success
 */
async function postToInstagram(contentItem) {
  console.log(`[POSTER] Would post to Instagram: "${contentItem.title}"`);
  // TODO: Implement actual Instagram Graph API integration
  return true;
}

/**
 * Auto-post an approved content item to appropriate platforms.
 * @param {Object} contentItem
 */
async function autoPost(contentItem) {
  const results = [];

  // Social posts go to Facebook and Instagram
  if (contentItem.type === 'social_post') {
    results.push(await postToFacebook(contentItem));
    results.push(await postToInstagram(contentItem));
  }

  // Google posts go to GBP
  if (contentItem.type === 'google_post') {
    results.push(await postToGoogleBusiness(contentItem));
  }

  // Email drafts are just logged (send via email campaign later)
  if (contentItem.type === 'email') {
    console.log(`[POSTER] Email draft ready for campaign: "${contentItem.title}"`);
  }

  return results.every(r => r !== false);
}

module.exports = { autoPost, postToGoogleBusiness, postToFacebook, postToInstagram };