function relativeToAbsolute(base, url) {
  if (url.indexOf('://') > -1) return url;
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

module.exports = {
  FrontEnd: {
    base: new URL(
      process.env.FRONTEND_BASE_PATH,
      `${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}${
        (process.env.FRONTEND_PROTOCOL == 'http' && process.env.FRONTEND_PORT == 80) ||
        (process.env.FRONTEND_PROTOCOL == 'https' && process.env.FRONTEND_PORT == 443)
          ? ''
          : `:${process.env.FRONTEND_PORT}`
      }`
    ).href,
    absolute(url) {
      return relativeToAbsolute(this.base, url);
    },
  },
  BackEnd: {
    base: new URL(
      process.env.BACKEND_BASE_PATH,
      `${process.env.BACKEND_PROTOCOL}://${process.env.BACKEND_HOST}${
        (process.env.BACKEND_PROTOCOL == 'http' && process.env.BACKEND_PORT == 80) ||
        (process.env.BACKEND_PROTOCOL == 'https' && process.env.BACKEND_PORT == 443)
          ? ''
          : `:${process.env.BACKEND_PORT}`
      }`
    ).href,
    absolute(url) {
      return relativeToAbsolute(process.env.BACKEND_BASE_URL, url);
    },
  },
};
