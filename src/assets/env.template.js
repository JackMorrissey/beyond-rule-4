(function(window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["clientId"] = window["env"]["clientId"] || "${CLIENT_ID}";
  window["env"]["appUrl"] = window["env"]["appUrl"] || "${APP_URL}";
})(this);
