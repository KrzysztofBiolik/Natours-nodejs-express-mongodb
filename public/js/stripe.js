import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // You don't even need next line
    // const stripe = Stripe(settings.stripePublicKey);
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    if (res.status === 200) location.assign(res.data.session.url);
  } catch (err) {
    // TODO: err.response.data.message is not always defined (try smth like await axios('123${settings.baseApiUrl}/bookings/checkout-session/${tourId}') and check err.message)
    showAlert('error', err.response.data.message);
  }
};
