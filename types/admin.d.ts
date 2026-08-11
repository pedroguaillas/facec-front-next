export interface CheckAvailabilityResponse {
    succes: boolean;
    user: { registered: boolean };
    email: { valid: boolean; registered: boolean };
}
