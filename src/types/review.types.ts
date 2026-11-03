// Same shape as backend reviews.service.ts ReviewView
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  // first name only
  from: { id: string; firstName: string; role: 'passenger' | 'driver' };
}
