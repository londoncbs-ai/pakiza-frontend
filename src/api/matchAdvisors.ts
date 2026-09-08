import { api } from './client';
import type {
  MatchAdvisorOffer,
  MatchAdvisorOfferInput,
  MatchAdvisorProfile,
  MatchAdvisorProfileInput,
  MatchAdvisorRequest,
  MatchAdvisorRequestInput,
} from './types';

export const matchAdvisorsApi = {
  listVerifiedAdvisors() {
    return api.get<MatchAdvisorProfile[]>('/match-advisors/advisors').then((r) => r.data);
  },

  getMyProfile() {
    return api.get<MatchAdvisorProfile>('/match-advisors/advisors/me').then((r) => r.data).catch((err) => {
      if (err?.response?.status === 404) return null;
      throw err;
    });
  },

  createProfile(input: MatchAdvisorProfileInput) {
    return api.post<MatchAdvisorProfile>('/match-advisors/advisors', input).then((r) => r.data);
  },

  submitVerification(input: { id_document_type: string; id_document_url: string; selfie_photo_url: string; consent_confirmed: boolean }) {
    return api.post<MatchAdvisorProfile>('/match-advisors/advisors/verification', input).then((r) => r.data);
  },

  createRequest(input: MatchAdvisorRequestInput) {
    return api.post<MatchAdvisorRequest>('/match-advisors/requests', input).then((r) => r.data);
  },

  getMyRequests() {
    return api.get<MatchAdvisorRequest[]>('/match-advisors/requests/me').then((r) => r.data);
  },

  getRequest(requestId: string) {
    return api.get<MatchAdvisorRequest>(`/match-advisors/requests/${requestId}`).then((r) => r.data);
  },

  checkoutDeposit(requestId: string) {
    return api.post<import('@/lib/stripeSheet').StripeCheckoutSession>(`/match-advisors/requests/${requestId}/deposit-checkout`).then((r) => r.data);
  },

  confirmDeposit(requestId: string, paymentIntentId?: string | null) {
    return api.post<MatchAdvisorRequest>(`/match-advisors/requests/${requestId}/deposit-confirm`, { payment_intent_id: paymentIntentId }).then((r) => r.data);
  },

  checkoutFinal(requestId: string) {
    return api.post<import('@/lib/stripeSheet').StripeCheckoutSession>(`/match-advisors/requests/${requestId}/final-checkout`).then((r) => r.data);
  },

  confirmFinal(requestId: string, paymentIntentId?: string | null) {
    return api.post<MatchAdvisorRequest>(`/match-advisors/requests/${requestId}/final-confirm`, { payment_intent_id: paymentIntentId }).then((r) => r.data);
  },

  listOffers(requestId: string) {
    return api.get<MatchAdvisorOffer[]>(`/match-advisors/requests/${requestId}/offers`).then((r) => r.data);
  },

  getOffer(offerId: string) {
    return api.get<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}`).then((r) => r.data);
  },

  acceptOffer(offerId: string, accepted = true) {
    return api.post<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}/accept`, { accepted }).then((r) => r.data);
  },

  payOffer(offerId: string, feePence: number) {
    return api.post<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}/pay`, { fee_pence: feePence }).then((r) => r.data);
  },

  createOffer(input: MatchAdvisorOfferInput) {
    return api.post<MatchAdvisorOffer>('/match-advisors/offers', input).then((r) => r.data);
  },

  getOfferMessages(offerId: string) {
    return api.get<import('./types').MatchAdvisorOfferMessage[]>(`/match-advisors/offers/${offerId}/messages`).then((r) => r.data);
  },

  sendOfferMessage(offerId: string, input: import('./types').MatchAdvisorOfferMessageInput) {
    return api.post<import('./types').MatchAdvisorOfferMessage>(`/match-advisors/offers/${offerId}/messages`, input).then((r) => r.data);
  },


  updateRequest(requestId: string, input: any) {
    return api.patch<MatchAdvisorRequest>(`/match-advisors/requests/${requestId}`, input).then((r) => r.data);
  },

  deleteRequest(requestId: string) {
    return api.delete(`/match-advisors/requests/${requestId}`).then((r) => r.data);
  },

  updateOffer(offerId: string, input: any) {
    return api.patch<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}`, input).then((r) => r.data);
  },

  deleteOffer(offerId: string) {
    return api.delete(`/match-advisors/offers/${offerId}`).then((r) => r.data);
  },

  getReceivedOffers() {
    return api.get<MatchAdvisorOffer[]>('/match-advisors/offers/received').then((r) => r.data);
  },
  completeOffer(offerId: string, rating: number) {
    return api.post<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}/complete?rating=${rating}`).then((r) => r.data);
  },
};

export const getSearchStatusConfig = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'cancelled':
      return {
        label: 'CANCELLED SEARCH',
        short: 'CANCELLED',
        color: '#c2410c',
        bg: 'rgba(194, 65, 12, 0.12)',
        icon: 'close-circle' as const,
      };
    case 'completed':
      return {
        label: 'CLOSED • SUCCESSFUL',
        short: 'CLOSED',
        color: '#d97706',
        bg: 'rgba(217, 119, 6, 0.12)',
        icon: 'checkmark-circle' as const,
      };
    case 'expired':
      return {
        label: 'INACTIVE SEARCH',
        short: 'INACTIVE',
        color: '#64748b',
        bg: 'rgba(100, 116, 139, 0.12)',
        icon: 'time' as const,
      };
    default:
      return {
        label: 'ACTIVE PRIVATE SEARCH',
        short: 'ACTIVE',
        color: '#16a34a',
        bg: 'rgba(34, 197, 94, 0.12)',
        icon: 'radio-button-on' as const,
      };
  }
};

export const getSearchDisplayTitle = (req: MatchAdvisorRequest) => {
  if (
    req.request_title &&
    !['private matchmaking search', 'private search'].includes(req.request_title.trim().toLowerCase())
  ) {
    return req.request_title;
  }
  if (req.advisor_name) {
    return `Search with ${req.advisor_name}${req.preferred_location ? ` • ${req.preferred_location}` : ''}`;
  }
  if (req.preferred_location) {
    return `Search • ${req.preferred_location}`;
  }
  return 'Personal Matchmaking Case';
};
