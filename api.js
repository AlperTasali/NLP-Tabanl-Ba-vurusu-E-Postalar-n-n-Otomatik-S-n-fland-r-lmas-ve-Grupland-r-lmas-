// İskelet dosya: Backend (Django REST API) hazır olduğunda doldurulacak.
// Axios kullanılacaksa: npm install axios

export const BASE_URL = ''; // örn: 'http://<IP>:8000/api'

export const loginUser = async (email, password) => {
  // TODO: POST /auth/login/
};

export const registerUser = async (userData) => {
  // TODO: POST /auth/register/
  // userData: { firstName, lastName, email, password, companyName }
};

export const logoutUser = async () => {
  // TODO: POST /auth/logout/
};

export const refreshToken = async () => {
  // TODO: POST /auth/token/refresh/
};