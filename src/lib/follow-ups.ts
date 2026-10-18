
export type FollowUpStatus = "Pending" | "Completed";

export type FollowUp = {
    id: string;
    application_id: string;
    due_at: string;
    status: string;
    notes: string | null;
    completed_at: string | null;
};

export type FollowUpFilter =
    | "All"
    | "Pending"
    | "Overdue"
    | "Completed";

export function isOverdue(
    followUp: FollowUp,
    now: number
): boolean {
    const dueDate = new Date(followUp.due_at).getTime();

    return (
        followUp.status === "Pending" &&
        Number.isFinite(dueDate) &&
        Number.isFinite(now) &&
        dueDate < now
    );
}

export function filterFollowUps(
    followUps: FollowUp[],
    filter: FollowUpFilter,
    now: number
): FollowUp[] {
    switch (filter) {
        case "All":
            return followUps;

        case "Pending":
            return followUps.filter(
                (item) => item.status === "Pending"
            );

        case "Completed":
            return followUps.filter(
                (item) => item.status === "Completed"
            );

        case "Overdue":
            return followUps.filter((item) =>
                isOverdue(item, now)
            );
    }
}

export function getFollowUpStats(
    followUps: FollowUp[],
    now: number
) {
    return {
        pending: followUps.filter(
            (item) => item.status === "Pending"
        ).length,

        overdue: followUps.filter((item) =>
            isOverdue(item, now)
        ).length,

        completed: followUps.filter(
            (item) => item.status === "Completed"
        ).length,
    };
}
