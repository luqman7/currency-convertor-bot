const Axios = require('Axios');
BASE_URL = "https://free.currconv.com/api/v7/";
API_KEY = "47cb66f735bbffa9a5ca";

module.exports = {
  /**
   * Get the rate exchange
   * @param {*} source
   * @param {*} destination
   */
  getRate(source, destination) {
    query = `${source}_${destination}`;
    return Axios.get(`${BASE_URL}convert?q=${query}&compact=ultra&apiKey=${API_KEY}`);
  }
};