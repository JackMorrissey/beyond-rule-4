export const environment = {
  production: true,
  clientId: (window['env']['clientId'] || 'e9755d570a9a471868f54697e4d989fc3d5785b067c7e4b556b85ed6be3606c0'),
  redirectUri: (window['env']['appUrl'] || 'https://beyondrule4.jmmorrissey.com') + '/connect'
};
