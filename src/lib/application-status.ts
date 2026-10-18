
export const APPLICATION_STATUSES = [
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Offer",
    "Rejected"
] as const;

export type ApplicationStatus =
    (typeof APPLICATION_STATUSES)[number];

export function isValidApplicationStatus(
    value: string
): value is ApplicationStatus {
    return APPLICATION_STATUSES.some(
        (status) => status === value
    );
}

export function isActiveApplicationStatus(
    value: string
): boolean {
    return (
        isValidApplicationStatus(value) &&
        value !== "Rejected" &&
        value !== "Offer"
    );
}
