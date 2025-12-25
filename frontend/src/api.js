import axios from 'axios';

// Configure axios to work with Django session auth + CSRF
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export default axios;
