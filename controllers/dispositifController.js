const dispositif = require('./dispositif/lib.js');
const checkToken = require('./account/checkToken');

module.exports = function (app) {
  app.post('/add_dispositif', checkToken.check, dispositif.add_dispositif);
  app.post('/get_dispositif', dispositif.get_dispositif);
  app.post('/count_dispositifs', dispositif.count_dispositifs);
  app.post('/update_dispositif', checkToken.getId, dispositif.update_dispositif);
  app.post('/get_dispo_progression', checkToken.check, dispositif.get_dispo_progression);  
}